const User = require("../models/User");

exports.getMe = async (req, res) => {
  return res.json({ user: req.user.toSafeJSON() });
};

exports.updateMe = async (req, res) => {
  try {
    const { name, profile } = req.body || {};

    if (typeof name === "string" && name.trim()) req.user.name = name.trim();
    if (profile && typeof profile === "object") {
      req.user.profile = {
        ...req.user.profile,
        ...profile,
      };
      if (typeof profile.phone === "string") {
        req.user.phone = profile.phone;
      }
    }

    await req.user.save();
    return res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Avatar file is required" });

    const relative = `/uploads/avatars/${req.file.filename}`;
    req.user.profile.avatarUrl = relative;
    await req.user.save();

    return res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ message: "Avatar update failed", error: err.message });
  }
};

exports.getPublicProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const safe = user.toSafeJSON();
    delete safe.email;
    delete safe.phone;

    return res.json({ user: safe });
  } catch (err) {
    return res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

