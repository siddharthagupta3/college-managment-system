const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { avatarUpload } = require("../middleware/upload");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/me", requireAuth, userController.getMe);
router.patch("/me", requireAuth, userController.updateMe);
router.post(
  "/me/avatar",
  requireAuth,
  avatarUpload.single("avatar"),
  userController.updateAvatar
);
router.get("/username/:username", userController.getPublicProfileByUsername);

module.exports = router;

