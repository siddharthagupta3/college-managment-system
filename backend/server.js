require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const { connectDb } = require("./src/config/db");
const { createApp } = require("./src/app");
const { registerSocketHandlers } = require("./src/sockets");

async function main() {
  const port = Number(process.env.PORT || 5000);

  await connectDb(process.env.MONGODB_URI);

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  server.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});