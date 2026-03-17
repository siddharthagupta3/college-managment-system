const mongoose = require("mongoose");
const AiChat = require("../models/AiChat");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

exports.status = async (req, res) => {
  return res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: GEMINI_MODEL,
    userId: String(req.user?._id || ""),
  });
};

function mapToGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.text }],
  }));
}

function extractGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text)
      .filter(Boolean)
      .join(" ")
      .trim() || ""
  );
}

exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    const username = user.username || user.name || "User";
    const profilePic = user?.profile?.avatarUrl || user.profileImage || "";

    return res.json({
      user: {
        userId: String(user._id),
        username,
        profilePic,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load profile", error: err.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await AiChat.find({ userId }).sort({ updatedAt: -1 }).lean();
    return res.json({ chats });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch chat history", error: err.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured" });
    }

    const userId = req.user._id;
    const { message, chatId } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    let chatDoc = null;

    if (chatId) {
      if (!mongoose.isValidObjectId(chatId)) {
        return res.status(400).json({ message: "Invalid chatId" });
      }
      chatDoc = await AiChat.findOne({ _id: chatId, userId });
      if (!chatDoc) {
        return res.status(404).json({ message: "Chat not found" });
      }
    } else {
      chatDoc = await AiChat.create({ userId, messages: [] });
    }

    const userMessage = { role: "user", text: message.trim() };
    chatDoc.messages.push(userMessage);

    const recent = chatDoc.messages.slice(-20);
    const contents = mapToGeminiContents(recent);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({ contents }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      return res.status(502).json({ message: "Gemini API error", details });
    }

    const data = await response.json();
    const aiText = extractGeminiText(data) || "I could not generate a response right now.";

    chatDoc.messages.push({ role: "ai", text: aiText });
    await chatDoc.save();

    return res.json({
      chatId: String(chatDoc._id),
      userMessage,
      aiMessage: { role: "ai", text: aiText },
    });
  } catch (err) {
    return res.status(500).json({ message: "AI chat failed", error: err.message });
  }
};
