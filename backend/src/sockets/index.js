const jwt = require("jsonwebtoken");
const { setIO } = require("./io");

function getTokenFromSocket(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return authToken;

  const header = socket.handshake?.headers?.authorization || "";
  const [type, token] = header.split(" ");
  if (type === "Bearer" && token) return token;

  return null;
}

function registerSocketHandlers(io) {
  setIO(io);

  io.use((socket, next) => {
    try {
      const token = getTokenFromSocket(socket);
      if (!token) return next(new Error("Missing token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = payload.sub;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Personal room for notifications
    socket.join(`user:${socket.data.userId}`);

    socket.on("join:group", ({ groupId }) => {
      if (groupId) socket.join(`group:${groupId}`);
    });

    socket.on("leave:group", ({ groupId }) => {
      if (groupId) socket.leave(`group:${groupId}`);
    });
  });
}

module.exports = { registerSocketHandlers };

