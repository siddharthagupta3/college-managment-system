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
router.get("/search", requireAuth, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    if (!q) return res.json({ users: [] });

    const users = await require("../models/User")
      .find({
        $or: [{ username: { $regex: q, $options: "i" } }, { name: { $regex: q, $options: "i" } }],
      })
      .select("name username profile.avatarUrl verifiedBadge")
      .limit(25);

    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Search failed", error: err.message });
  }
});

module.exports = router;

