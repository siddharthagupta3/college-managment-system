const express = require("express");
const { requireAuth } = require("../middleware/auth");
const geminiChatController = require("../controllers/geminiChatController");

const router = express.Router();

router.get("/chat/status", requireAuth, geminiChatController.status);
router.get("/chat/profile", requireAuth, geminiChatController.getMyProfile);
router.post("/chat", requireAuth, geminiChatController.chat);
router.get("/chats", requireAuth, (req, res, next) => {
	if (String(req.query.ai || "") !== "1") return next();
	return geminiChatController.getChats(req, res, next);
});

module.exports = router;
