const UserSettings = require("../models/UserSettings");

function fallbackFromUser(user) {
  return {
    profile: {
      fullName: user?.name || "",
      email: user?.email || "",
      role: user?.role || "",
      bio: user?.profile?.bio || "",
      avatarDataUrl: user?.profile?.avatarUrl || "",
    },
    preferences: {
      emailNotifications: true,
      desktopReminders: false,
      weeklySummary: true,
    },
  };
}

exports.getMySettings = async (req, res) => {
  try {
    const existing = await UserSettings.findOne({ userId: req.user._id });
    if (existing) return res.json({ settings: existing });

    return res.json({ settings: fallbackFromUser(req.user) });
  } catch (err) {
    return res.status(500).json({ message: "Unable to fetch settings", error: err.message });
  }
};

exports.updateMySettings = async (req, res) => {
  try {
    const payload = req.body || {};
    const profile = payload.profile && typeof payload.profile === "object" ? payload.profile : {};
    const preferences =
      payload.preferences && typeof payload.preferences === "object" ? payload.preferences : {};

    const safeProfile = {
      fullName: typeof profile.fullName === "string" ? profile.fullName : "",
      email: typeof profile.email === "string" ? profile.email : "",
      role: typeof profile.role === "string" ? profile.role : "",
      bio: typeof profile.bio === "string" ? profile.bio : "",
      avatarDataUrl: typeof profile.avatarDataUrl === "string" ? profile.avatarDataUrl : "",
    };

    const safePreferences = {
      emailNotifications: Boolean(preferences.emailNotifications),
      desktopReminders: Boolean(preferences.desktopReminders),
      weeklySummary: Boolean(preferences.weeklySummary),
    };

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          userId: req.user._id,
          profile: safeProfile,
          preferences: safePreferences,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ message: "Unable to update settings", error: err.message });
  }
};
