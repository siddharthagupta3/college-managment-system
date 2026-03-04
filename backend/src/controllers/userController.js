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
    }

    await req.user.save();
    return res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const safe = user.toSafeJSON();
    // Keep profile page "Instagram-like" but safe by default
    delete safe.email;
    return res.json({ user: safe });
  } catch (err) {
    return res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

