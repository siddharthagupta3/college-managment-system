const express = require("express");
const { requireAuth } = require("../middleware/auth");
const aiController = require("../controllers/aiController");

const router = express.Router();

// Simple chat endpoint for Gemini
router.post("/chat", requireAuth, aiController.chat);

module.exports = router;

