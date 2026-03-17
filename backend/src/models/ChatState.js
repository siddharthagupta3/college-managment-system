const mongoose = require("mongoose");

const chatStateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    archived: { type: Boolean, default: false, index: true },
    lastReadAt: { type: Date, default: null },
    pinned: { type: Boolean, default: false },
    muted: { type: Boolean, default: false },
    wallpaper: { type: String, default: "" },
  },
  { timestamps: true }
);

chatStateSchema.index({ user: 1, group: 1 }, { unique: true });

module.exports = mongoose.model("ChatState", chatStateSchema);

