// server.ts
import { sendTraceEvent } from "./lib/trace/sendTraceEvent";

import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getHeader } from "./lib/http/headers";
import { timingSafeEqual } from "./lib/http/timingSafeEqual";
import { readJsonBodyWithLimit } from "./lib/http/readJsonBodyWithLimit";
import { isEventType } from "./lib/events/guards/isEventType";
import { eventSchemas } from "./lib/trace/sсhemas";
import { createClient } from "@supabase/supabase-js";

/* =========================
   Redis
========================= */

const redisChatHost = process.env.REDIS_CHAT_HOST || "redis-chat";
const redisChatPort = +(process.env.REDIS_CHAT_PORT || 6379);

const redisObsHost = process.env.REDIS_OBS_HOST || "redis-obs";
const redisObsPort = +(process.env.REDIS_OBS_PORT || 6379);

const redisChat = new Redis(redisChatPort, redisChatHost);

const redisObs = new Redis(redisObsPort, redisObsHost); // XADD, XACK, XTRIM
const redisObsConsumer = new Redis(redisObsPort, redisObsHost); // XREADGROUP BLOCK
/* =========================
   ENV CHECK
========================= */

console.log("ENV CHECK:", {
  redisChatHost,
  redisChatPort,
  redisObsHost,
  redisObsPort,
  clientOrigin: process.env.CLIENT_ORIGIN,
  wsMessengerPort: process.env.WS_MESSENGER_PORT,
  wsEventsPort: process.env.WS_EVENTS_PORT,
});

/* =========================
   Chat keys
========================= */

function dialogKey(a: string, b: string) {
  return `messages:${[a, b].sort().join(":")}`;
}
function dialogsSet(userId: string) {
  return `dialogs:${userId}`;
}
function unreadKey(userId: string, peerId: string) {
  return `unread:${userId}:${peerId}`;
}

/* =========================
   OBSERVABILITY (Redis Streams)
========================= */

const STREAM = "system-events";
const GROUP = "ws-group";
const CONSUMER = process.env.WS_EVENTS_CONSUMER || "ws-events-1";

function mapFields(fields: any[]): any {
  const obj: any = {};
  for (let i = 0; i < fields.length; i += 2) obj[fields[i]] = fields[i + 1];

  if (obj.event) {
    try {
      return JSON.parse(obj.event);
    } catch {
      return obj.event;
    }
  }
  return obj;
}

async function ensureGroup() {
  try {
    await redisObs.xgroup("CREATE", STREAM, GROUP, "0", "MKSTREAM");
  } catch (e: any) {
    if (!String(e.message).includes("BUSYGROUP")) throw e;
  }
}

/**
 * Consumer запускается ТОЛЬКО на events-сервере и эмитит события только в eventsIO
 */
async function startObservabilityConsumer(eventsIO: Server) {
  await ensureGroup();

  console.log("🟣 [OBS] consumer started", {
    STREAM,
    GROUP,
    CONSUMER,
  });

  /* =========================
     1️⃣ Drain PENDING events
     ========================= */

  try {
    const pending = await (redisObsConsumer as any).xreadgroup(
      "GROUP",
      GROUP,
      CONSUMER,
      "COUNT",
      10,
      "STREAMS",
      STREAM,
      "0",
    );

    if (pending) {
      console.log("🟡 [OBS] draining pending events:", pending[0][1].length);

      for (const [, events] of pending) {
        for (const [id, fields] of events) {
          const event = mapFields(fields);

          console.log("🟡 [OBS] emit pending event", event.type, event.traceId);

          eventsIO.emit("system:event", event);
          await redisObs.xack(STREAM, GROUP, id);
        }
      }
    }
  } catch (err) {
    console.error("[OBS] pending drain error:", err);
  }

  /* =========================
     2️⃣ Main consume loop
     ========================= */

  while (true) {
    try {
      const res = await (redisObsConsumer as any).xreadgroup(
        "GROUP",
        GROUP,
        CONSUMER,
        "BLOCK",
        0,
        "COUNT",
        10,
        "STREAMS",
        STREAM,
        ">",
      );

      if (!res) continue;

      for (const [, events] of res) {
        for (const [id, fields] of events) {
          const event = mapFields(fields);

          console.log("🟢 [OBS] emit event", event.type, event.traceId);

          eventsIO.emit("system:event", event);
          await redisObs.xack(STREAM, GROUP, id);
        }
      }
    } catch (err) {
      console.error("[OBS] consumer error:", err);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

/* =========================
   Shared socket auth middleware
========================= */

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
);

async function socketAuth(socket: any, next: any) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return next(new Error("Invalid token"));
    }

    socket.data.userId = data.user.id;
    next();
  } catch (err) {
    console.error("[WS AUTH] failed", err);
    return next(new Error("Auth failed"));
  }
}

/* =========================
   SERVER #1: WS MESSENGER (chat only)
========================= */

const WS_MESSENGER_PORT = +(process.env.WS_MESSENGER_PORT || 4000);

const messengerHttpServer = createServer((req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("FlowScope WS Messenger is running");
    return;
  }
  res.writeHead(404);
  res.end();
});

const messengerIO = new Server(messengerHttpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? true,
    credentials: true,
  },
});

messengerIO.use(socketAuth);

messengerIO.on("connection", (socket: any) => {
  const userId = socket.data.userId;
  socket.join(userId);

  console.log("[WS][CHAT] connected", {
    socketId: socket.id,
    userId,
    rooms: Array.from(socket.rooms),
  });

  socket.on("disconnect", (reason: string) => {
    console.log("[WS][CHAT] disconnect", {
      socketId: socket.id,
      userId,
      reason,
    });
  });

  /* ---- dialogs:list ---- */
  socket.on("dialogs:list", async () => {
    try {
      const peers = await redisChat.smembers(dialogsSet(userId));
      const dialogs: any[] = [];

      for (const peerId of peers) {
        const stream = dialogKey(userId, peerId);
        const last = await redisChat.xrevrange(stream, "+", "-", "COUNT", 1);
        const unread = Number(
          (await redisChat.get(unreadKey(userId, peerId))) ?? 0,
        );

        if (last.length) {
          const [id, fields] = last[0];
          const msg: any = { id };
          for (let i = 0; i < fields.length; i += 2) {
            msg[fields[i]] = fields[i + 1];
          }

          dialogs.push({ peerId, lastMessage: msg, unread });
        }
      }

      socket.emit("dialogs:list", dialogs);
    } catch (e) {
      console.error("dialogs:list error:", e);
    }
  });

  /* ---- dialog:open ---- */
  socket.on(
    "dialog:open",
    async ({ peerId, limit = 50 }: { peerId: string; limit?: number }) => {
      const stream = dialogKey(userId, peerId);

      try {
        const history = await redisChat.xrevrange(
          stream,
          "+",
          "-",
          "COUNT",
          limit,
        );

        const messages = history
          .reverse()
          .map(([id, fields]: [string, string[]]) => {
            const obj: any = { id };
            for (let i = 0; i < fields.length; i += 2)
              obj[fields[i]] = fields[i + 1];
            return obj;
          });

        await redisChat.del(unreadKey(userId, peerId));

        const roomUser =
          messengerIO.sockets.adapter.rooms.get(userId)?.size ?? 0;
        const roomPeer =
          messengerIO.sockets.adapter.rooms.get(peerId)?.size ?? 0;

        console.log("[WS][CHAT] room sizes (dialog:open)", {
          userId,
          roomUser,
          peerId,
          roomPeer,
          socketRooms: Array.from(socket.rooms),
        });

        socket.emit("dialog:history", { peerId, messages });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("dialog:open error:", e);
      }
    },
  );

  /* ---- dialog:clear ---- */
  socket.on("dialog:clear", async ({ peerId }: { peerId: string }) => {
    const stream = dialogKey(userId, peerId);

    try {
      await redisChat.del(stream);
      await redisChat.del(unreadKey(userId, peerId));
      await redisChat.del(unreadKey(peerId, userId));

      socket.emit("dialog:cleared", { peerId });
      socket.to(peerId).emit("dialog:cleared", { peerId: userId });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("dialog:clear error:", e);
    }
  });

  /* ---- message:send (без логических изменений) ---- */
  socket.on(
    "message:send",
    async ({
      to,
      text,
      trace,
    }: {
      to: string;
      text: string;
      trace?: { traceId: string };
    }) => {
      const traceId = trace?.traceId || crypto.randomUUID();
      const type = "MESSAGE";

      console.log("[WS][CHAT] message:send recv", {
        socketId: socket.id,
        userId,
        to,
        textLen: text?.length,
      });

      /* =========================
       ❌ VALIDATION
       ========================= */
      if (!to || !text) {
        sendTraceEvent({
          traceId,
          type,
          node: "ws",
          actorId: userId,
          dialogId: to ? `${userId}:${to}` : undefined,
          outcome: "error",
          timestamp: Date.now(),
          payload: { text },
          error: { message: "Missing 'to' or 'text' in message" },
        });
        return;
      }

      /* =========================
       🟢 PHASE 1: CLIENT INTENT (ingress)
       ========================= */
      sendTraceEvent({
        traceId,
        type: "MESSAGE",
        node: "client_1",
        actorId: userId,
        dialogId: `${userId}:${to}`,
        payload: { text },
        outcome: "success",
        timestamp: Date.now(),
      });

      /* =========================
       🔀 PHASE BOUNDARY
       ========================= */
      await Promise.resolve();
      // ↑ гарантированная граница фаз (microtask)

      /* =========================
       🟢 PHASE 2: WS PROCESSING
       ========================= */
      sendTraceEvent({
        traceId,
        type,
        node: "ws",
        actorId: userId,
        dialogId: `${userId}:${to}`,
        outcome: "success",
        timestamp: Date.now(),
        payload: { text: "Server" },
      });

      const timestamp = new Date().toISOString();
      const stream = dialogKey(userId, to);

      let messageId: string;

      try {
        /* =========================
         🟢 REDIS WRITE
         ========================= */
        const id = await redisChat.xadd(
          stream,
          "*",
          "from",
          userId,
          "to",
          to,
          "text",
          text,
          "timestamp",
          timestamp,
        );

        if (!id) {
          throw new Error("Redis xadd returned null");
        }
        messageId = id;

        console.log("[WS][CHAT] redis xadd ok", {
          stream,
          id: messageId,
        });

        await redisChat.sadd(dialogsSet(userId), to);
        await redisChat.sadd(dialogsSet(to), userId);
        await redisChat.incr(unreadKey(to, userId));

        sendTraceEvent({
          traceId,
          type,
          node: "redis",
          actorId: userId,
          dialogId: `${userId}:${to}`,
          outcome: "success",
          timestamp: Date.now(),
          payload: { text },
        });
      } catch (redisErr: any) {
        sendTraceEvent({
          traceId,
          type,
          node: "redis",
          actorId: userId,
          dialogId: `${userId}:${to}`,
          outcome: "error",
          timestamp: Date.now(),
          payload: { text },
          error: { message: redisErr.message },
        });
        return;
      }

      /* =========================
       🟢 EMIT TO CLIENTS
       ========================= */
      const message = {
        id: messageId,
        from: userId,
        to,
        text,
        timestamp,
      };

      console.log("[WS][CHAT] emit message:new", {
        toRooms: [userId, to],
        messageId,
      });

      try {
        messengerIO.to(userId).emit("message:new", message);
        messengerIO.to(to).emit("message:new", message);

        sendTraceEvent({
          traceId,
          type,
          node: "client_2",
          actorId: userId,
          dialogId: `${userId}:${to}`,
          outcome: "success",
          timestamp: Date.now(),
          payload: { text },
        });
      } catch (emitErr: any) {
        sendTraceEvent({
          traceId,
          type,
          node: "client_receive",
          actorId: userId,
          dialogId: `${userId}:${to}`,
          outcome: "error",
          timestamp: Date.now(),
          payload: { text },
          error: { message: emitErr.message },
        });
      }
    },
  );
});

/* =========================
   SERVER #2: WS EVENTS (observability only + /trace ingest)
========================= */

const WS_EVENTS_PORT = +(process.env.WS_EVENTS_PORT || 4001);

const eventsHttpServer = createServer(async (req, res) => {
  // health
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("FlowScope WS Events is running");
    return;
  }

  // trace ingest (SECURED)
  if (req.method === "POST" && req.url?.startsWith("/trace")) {
    // AUTH: shared secret
    const secret = process.env.TRACE_INGEST_SECRET;

    if (!secret) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, reason: "trace_ingest_disabled" }));
      return;
    }

    const provided = getHeader(req, "x-trace-secret");
    if (!provided || !timingSafeEqual(provided, secret)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, reason: "unauthorized" }));
      return;
    }

    // RATE LIMIT (per IP)
    const ip =
      getHeader(req, "x-forwarded-for")?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const WINDOW_SEC = 60;
    const LIMIT = 100;

    const key = `trace:rl:${ip}`;
    const count = await redisObs.incr(key);

    if (count === 1) {
      await redisObs.expire(key, WINDOW_SEC);
    }

    if (count > LIMIT) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, reason: "rate_limited" }));
      return;
    }

    // SAFE BODY READ
    let body: unknown;
    const limit = +(process.env.TRACE_BODY_LIMIT || 65536); // 64KB

    try {
      body = await readJsonBodyWithLimit(req, limit, 1500);
    } catch (err: any) {
      const reason =
        err?.message === "body_too_large"
          ? "body_too_large"
          : err?.message === "body_timeout"
            ? "body_timeout"
            : err?.message === "invalid_json"
              ? "invalid_json"
              : "bad_request";

      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, reason }));
      return;
    }

    // SHAPE CHECK
    if (typeof body !== "object" || body === null || !("type" in body)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, reason: "invalid_body" }));
      return;
    }

    const rawType = (body as any).type;
    if (!isEventType(rawType)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, reason: "unknown_event_type" }));
      return;
    }

    // SCHEMA VALIDATION
    const schema = eventSchemas[rawType];
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: false,
          reason: "schema_validation_failed",
        }),
      );
      return;
    }

    // REDIS WRITE
    try {
      const id = await redisObs.xadd(
        STREAM,
        "*",
        "event",
        JSON.stringify(parsed.data),
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, id }));
    } catch (err) {
      console.error("[EVENTS][TRACE] redis error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, reason: "redis_write_failed" }));
    }

    return;
  }

  // default
  res.writeHead(404);
  res.end();
});

const eventsIO = new Server(eventsHttpServer, {
  path: "/events/socket.io",
  cors: {
    origin: process.env.CLIENT_ORIGIN?.split(",") ?? true,
    credentials: true,
  },
});

eventsIO.use(socketAuth);

eventsIO.on("connection", (socket: any) => {
  /* ---- system:history ---- */
  (async () => {
    try {
      const history = await redisObs.xrevrange(STREAM, "+", "-", "COUNT", 200);

      const parsed = history
        .reverse()
        .map(([_, fields]: [string, any[]]) => mapFields(fields));

      socket.emit("system:history", parsed);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("system:history error:", e);
    }
  })();

  /* ---- system:clear ---- */
  socket.on("system:clear", async () => {
    try {
      // eslint-disable-next-line no-console
      console.log("[EVENTS][OBS] CLEAR ALL EVENTS");
      await redisObs.xtrim(STREAM, "MAXLEN", 0);
      eventsIO.emit("system:cleared");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("system:clear error:", e);
    }
  });
});

/* =========================
   START BOTH SERVERS
========================= */

messengerHttpServer.listen(WS_MESSENGER_PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 WS Messenger listening on ${WS_MESSENGER_PORT}`);
});

eventsHttpServer.listen(WS_EVENTS_PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 WS Events listening on ${WS_EVENTS_PORT}`);
  startObservabilityConsumer(eventsIO);
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */

process.on("SIGINT", async () => {
  try {
    messengerIO.close();
    eventsIO.close();
    messengerHttpServer.close();
    eventsHttpServer.close();
  } catch {}

  await redisChat.quit();
  await redisObs.quit();
  await redisObsConsumer.quit();

  process.exit(0);
});
