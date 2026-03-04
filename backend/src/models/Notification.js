const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["message"], required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null, index: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

