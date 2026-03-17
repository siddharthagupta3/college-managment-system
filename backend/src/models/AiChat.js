const mongoose = require("mongoose");

const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12000,
    },
  },
  { _id: false, timestamps: true }
);

const aiChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: {
      type: [aiMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

aiChatSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("AiChat", aiChatSchema);
