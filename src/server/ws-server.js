const { createServer } = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");

const redis = new Redis(); // localhost:6379

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client is connected:", socket.id);

  socket.on("get_history", async () => {
    const redisMsgs = await redis.xrange("messages", "-", "+");
    socket.emit("message_history", redisMsgs);
  });

  socket.on("send_message", async (msg) => {
    const id = await redis.xadd(
      "messages",
      "*",
      "from",
      msg.from,
      "to",
      msg.to,
      "text",
      msg.text,
      "timestamp",
      new Date().toISOString()
    );
    io.emit("new_message", [
      id,
      [
        "from",
        msg.from,
        "to",
        msg.to,
        "text",
        msg.text,
        "timestamp",
        new Date().toISOString(),
      ],
    ]);
  });
});

httpServer.listen(4000, () => {
  console.log("WebSocket listen on the port 4000");
});
