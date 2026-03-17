const mongoose = require("mongoose");

const UserSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    profile: {
      fullName: { type: String, default: "" },
      email: { type: String, default: "" },
      role: { type: String, default: "" },
      bio: { type: String, default: "" },
      avatarDataUrl: { type: String, default: "" },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      desktopReminders: { type: Boolean, default: false },
      weeklySummary: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSettings", UserSettingsSchema);
