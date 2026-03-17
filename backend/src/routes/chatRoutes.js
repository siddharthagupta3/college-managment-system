const express = require("express");
const { requireAuth } = require("../middleware/auth");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.get("/", requireAuth, chatController.listChats);
router.post("/direct", requireAuth, chatController.createDirect);
router.post("/:groupId/read", requireAuth, chatController.markRead);
router.post("/:groupId/archive", requireAuth, chatController.archive);
router.post("/:groupId/unarchive", requireAuth, chatController.unarchive);

module.exports = router;

