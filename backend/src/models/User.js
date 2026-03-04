const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    username: { type: String, trim: true, lowercase: true, unique: true, required: true, index: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true, index: true },
    phone: { type: String, trim: true, required: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "faculty", "student"],
      required: true,
      index: true,
    },
    emailVerified: { type: Boolean, default: false, index: true },
    verificationToken: { type: String, default: null, index: true },
    verificationTokenExpiresAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null, index: true },
    resetPasswordExpiresAt: { type: Date, default: null },
    profile: {
      avatarUrl: { type: String, default: "" },
      bio: { type: String, default: "" },
      department: { type: String, default: "" },
      year: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    username: this.username,
    email: this.email,
    phone: this.phone,
    role: this.role,
    profile: this.profile,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);

