const { createServer } = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

/* =========================
   ENV CHECK
========================= */

console.log("ENV CHECK:", {
  redisHost: process.env.REDIS_HOST,
  clientOrigin: process.env.CLIENT_ORIGIN,
});

/* =========================
   Redis (messages + system-events)
========================= */

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || 6379;

const redis = new Redis(redisPort, redisHost);
const sub = redis.duplicate();

/* =========================
   HTTP + Socket.io
========================= */

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  },
});

/* =========================
   Redis → WS bridge (OBSERVABILITY)
========================= */

sub.subscribe("system-events");

sub.on("message", (channel, message) => {
  if (channel !== "system-events") return;

  const event = JSON.parse(message);
  console.log("[WS] redis system-event", event);

  io.emit("system:event", event);

  io.emit("system:event", {
    traceId: event.traceId,
    type: event.type,
    stage: "ws:emitted",
    timestamp: Date.now(),
  });
});


/* =========================
   Supabase JWT (ES256 via JWKS)
========================= */

const jwks = jwksClient({
  jwksUri:
    "https://rjblnkvogqvyntuslwlj.supabase.co/auth/v1/.well-known/jwks.json",
  requestHeaders: {
    apikey: process.env.SUPABASE_ANON_KEY,
  },
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
});

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("JWKS ERROR:", err.message);
      return callback(err);
    }
    callback(null, key.getPublicKey());
  });
}

/* =========================
   Socket auth middleware
========================= */

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  console.log("WS AUTH TOKEN:", token?.slice(0, 30));

  if (!token) {
    console.log("WS AUTH: NO TOKEN");
    return next(new Error("No token"));
  }

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["ES256"],
      audience: "authenticated",
    },
    (err, decoded) => {
      if (err) {
        console.log("WS JWT VERIFY ERROR:", err.message);
        return next(new Error("Invalid token"));
      }

      console.log("WS JWT OK:", decoded.sub);
      socket.data.userId = decoded.sub;
      next();
    }
  );
});

/* =========================
   Socket handlers (MESSENGER)
========================= */

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  console.log("Client connected:", userId, socket.id);

  socket.join(userId);

  socket.on("get_history", async () => {
    const redisMsgs = await redis.xrange("messages", "-", "+");
    socket.emit("message_history", redisMsgs);
  });

  socket.on("message:send", async ({ to, text }) => {
    if (!to || !text) return;

    const timestamp = new Date().toISOString();

    const id = await redis.xadd(
      "messages",
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

    const message = { id, from: userId, to, text, timestamp };

    io.to(userId).emit("message:new", message);
    io.to(to).emit("message:new", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", userId);
  });
});

/* =========================
   Start server
========================= */

httpServer.listen(4000, () => {
  console.log("WebSocket server listening on port 4000");
});
