const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
    lastMessageAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

groupSchema.index({ name: 1, createdBy: 1 });

module.exports = mongoose.model("Group", groupSchema);

