const express = require("express");
const { requireAuth } = require("../middleware/auth");
const messageController = require("../controllers/messageController");

const router = express.Router();

// Any authenticated user can read, send and react to messages
router.get("/group/:groupId", requireAuth, messageController.listGroupMessages);
router.post("/group/:groupId", requireAuth, messageController.sendGroupMessage);

router.post("/:messageId/react", requireAuth, messageController.reactToMessage);

module.exports = router;

