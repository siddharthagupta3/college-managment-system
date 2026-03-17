const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const chatRoutes = require("./routes/chatRoutes");
const postRoutes = require("./routes/postRoutes");
const geminiChatRoutes = require("./routes/geminiChatRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

function buildCorsOptions() {
  const raw = process.env.CORS_ORIGINS || "";
  const origins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (origins.length === 0) return { origin: true };
  return { origin: origins, credentials: true };
}

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads"), {
      maxAge: "7d",
    })
  );

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/groups", groupRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api", geminiChatRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/chats", chatRoutes);
  app.use("/api/resume", resumeRoutes);

  // Settings backend is scaffolded but disabled by default.
  if (String(process.env.ENABLE_SETTINGS_API || "false").toLowerCase() === "true") {
    app.use("/api/settings", settingsRoutes);
  }

  // 404
  app.use((req, res) => res.status(404).json({ message: "Not found" }));

  return app;
}

module.exports = { createApp };

