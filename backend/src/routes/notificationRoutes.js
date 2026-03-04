const express = require("express");
const { requireAuth } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.get("/", requireAuth, notificationController.listMyNotifications);
router.post("/read-all", requireAuth, notificationController.markAllRead);

module.exports = router;

