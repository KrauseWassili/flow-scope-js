import { sendTraceEvent } from "./lib/trace/sendTraceEvent";

import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/* =========================
   ENV CHECK
========================= */

console.log("ENV CHECK:", {
  redisHost: process.env.REDIS_HOST,
  clientOrigin: process.env.CLIENT_ORIGIN,
});

/* =========================
   Redis
========================= */

const redisHost = (process.env.REDIS_HOST as string) || "localhost";
const redisPort = +(process.env.REDIS_PORT || 6379);

const redisChat = new Redis(redisPort, redisHost);
const redisObs = new Redis(redisPort, redisHost);

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
   HTTP + Socket.IO
========================= */

const httpServer = createServer((req, res) => {
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("FlowScope WS server is running");
    return;
  }

  res.writeHead(404);
  res.end();
});


const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  },
});

/* =========================
   OBSERVABILITY (Redis Streams)
========================= */

const STREAM = "system-events";
const GROUP = "ws-group";
const CONSUMER = "ws-1";

function mapFields(fields: any[]): any {
  const obj: any = {};
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]] = fields[i + 1];
  }
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

async function startObservabilityConsumer() {
  await ensureGroup();

  while (true) {
    try {
      const res = await (redisObs as any).xreadgroup(
        "GROUP",
        GROUP,
        CONSUMER,
        "BLOCK",
        0,
        "COUNT",
        10,
        "STREAMS",
        STREAM,
        ">"
      );

      if (!res) continue;

      for (const [, events] of res as any) {
        for (const [id, fields] of events as any) {
          const event = mapFields(fields);
          io.emit("system:event", event);
          await redisObs.xack(STREAM, GROUP, id);
        }
      }
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

/* =========================
   Socket auth middleware
========================= */

io.use((socket: any, next: any) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));

  const decoded = jwt.decode(token) as any;
  if (!decoded?.sub) return next(new Error("Invalid token"));

  socket.data.userId = decoded.sub;
  next();
});

/* =========================
   SOCKET HANDLERS
========================= */

io.on("connection", (socket: any) => {
  const userId = socket.data.userId;
  socket.join(userId);

  /* ---- system:history ---- */

  (async () => {
    try {
      const history = await redisObs.xrevrange(
        STREAM,
        "+",
        "-",
        "COUNT",
        200
      );

      const parsed = history
        .reverse()
        .map(([_, fields]: [string, any[]]) => mapFields(fields));

      socket.emit("system:history", parsed);
    } catch (e) {
      console.error("system:history error:", e);
    }
  })();

  /* ---- system:clear (FIX) ---- */

  socket.on("system:clear", async () => {
    try {
      console.log("[WS][OBS] CLEAR ALL EVENTS");

      // 🔥 КЛЮЧЕВОЙ ФИКС
      await redisObs.xtrim(STREAM, "MAXLEN", 0);

      io.emit("system:cleared");
    } catch (e) {
      console.error("system:clear error:", e);
    }
  });

  /* ---- dialogs:list ---- */

  (async () => {
    try {
      const peers = await redisChat.smembers(dialogsSet(userId));
      const dialogs: any[] = [];

      for (const peerId of peers) {
        const stream = dialogKey(userId, peerId);
        const last = await redisChat.xrevrange(stream, "+", "-", "COUNT", 1);
        const unread = Number(
          (await redisChat.get(unreadKey(userId, peerId))) ?? 0
        );

        if (last.length) {
          const [id, fields] = last[0];
          const msg: any = { id };
          for (let i = 0; i < fields.length; i += 2)
            msg[fields[i]] = fields[i + 1];

          dialogs.push({ peerId, lastMessage: msg, unread });
        }
      }

      socket.emit("dialogs:list", dialogs);
    } catch (e) {
      console.error("dialogs:list error:", e);
    }
  })();

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
          limit
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

        socket.emit("dialog:history", { peerId, messages });
      } catch (e) {
        console.error("dialog:open error:", e);
      }
    }
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
      console.error("dialog:clear error:", e);
    }
  });

  /* ---- message:send (БЕЗ ИЗМЕНЕНИЙ) ---- */

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

      if (!to || !text) {
        await sendTraceEvent({
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

      try {
        await sendTraceEvent({
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
        let id;

        try {
          await redisChat.sadd(dialogsSet(userId), to);
          await redisChat.sadd(dialogsSet(to), userId);

          id = await redisChat.xadd(
            stream,
            "*",
            "from",
            userId,
            "to",
            to,
            "text",
            text,
            "timestamp",
            timestamp
          );

          await redisChat.incr(unreadKey(to, userId));

          await sendTraceEvent({
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
          await sendTraceEvent({
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
          throw redisErr;
        }

        const message = { id, from: userId, to, text, timestamp };

        try {
          io.to(userId).emit("message:new", message);
          io.to(to).emit("message:new", message);

          await sendTraceEvent({
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
          await sendTraceEvent({
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
      } catch (err: any) {
        await sendTraceEvent({
          traceId,
          type,
          node: "ws",
          actorId: userId,
          dialogId: `${userId}:${to}`,
          outcome: "error",
          timestamp: Date.now(),
          payload: { text },
          error: { message: err.message },
        });
      }
    }
  );
});

/* =========================
   START SERVER
========================= */

// const PORT = +(process.env.WS_PORT || 4000);
const WS_PORT = 4000;


// httpServer.listen(WS_PORT, () => {
//   console.log(`🚀 WebSocket server listening on port ${WS_PORT}`);
//   startObservabilityConsumer();
// });

httpServer.listen(WS_PORT, "0.0.0.0", () => {
  console.log(`🚀 WebSocket server listening on port ${WS_PORT}`);
  startObservabilityConsumer();
});


/* =========================
   GRACEFUL SHUTDOWN
========================= */

process.on("SIGINT", async () => {
  await redisChat.quit();
  await redisObs.quit();
  process.exit(0);
});
