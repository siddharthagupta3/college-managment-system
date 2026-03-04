const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.get("/group/:groupId", requireAuth, messageController.listGroupMessages);
router.post("/group/:groupId", requireAuth, requireRoles("admin", "faculty"), messageController.sendGroupMessage);

router.post("/:messageId/react", requireAuth, requireRoles("student"), messageController.reactToMessage);

module.exports = router;

