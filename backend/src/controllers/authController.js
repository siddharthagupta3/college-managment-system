const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail(to, subject, html) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const transport = createTransport();
  await transport.sendMail({ from, to, subject, html });
}

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "name, email, phone, password are required" });
    }

    if (!String(email).toLowerCase().includes("@")) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const lowerEmail = String(email).toLowerCase();

    const existingEmail = await User.findOne({ email: lowerEmail });
    if (existingEmail) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(String(password), 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const defaultUsername = `user_${crypto.randomBytes(4).toString("hex")}`;

    const user = await User.create({
      name,
      username: defaultUsername,
      email: lowerEmail,
      phone,
      passwordHash,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt: expires,
      profile: {},
    });

    const hasEmailConfig =
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.FRONTEND_URL;

    if (!hasEmailConfig) {
      // Dev fallback: skip email verification if SMTP/front URL not configured
      user.emailVerified = true;
      user.verificationToken = null;
      user.verificationTokenExpiresAt = null;
      await user.save();
      const token = signToken(user._id.toString());
      return res
        .status(201)
        .json({ message: "Account created (email verification skipped in dev).", token, user: user.toSafeJSON() });
    }

    const verifyUrl = `${process.env.FRONTEND_URL || ""}/verify.html?token=${verificationToken}`;
    await sendEmail(
      user.email,
      "Verify your CMS account",
      `<p>Hi ${user.name},</p>
       <p>Please verify your account by clicking the link below:</p>
       <p><a href="${verifyUrl}">Verify my email</a></p>
       <p>This link expires in 1 hour.</p>`
    );

    return res.status(201).json({ message: "Verification email sent. Please check your Gmail inbox." });
  } catch (err) {
    return res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token) return res.status(400).send("Missing token");

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) return res.status(400).send("Invalid or expired verification token.");

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    return res.send("Email verified successfully. You can close this tab and log in.");
  } catch (err) {
    return res.status(500).send("Verification failed.");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+passwordHash");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(user._id.toString());
    return res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.json({ message: "If this email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = expires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || ""}/reset-password.html?token=${token}`;
    await sendEmail(
      user.email,
      "Reset your CMS password",
      `<p>Hi ${user.name},</p>
       <p>Click the link below to reset your password:</p>
       <p><a href="${resetUrl}">Reset password</a></p>
       <p>This link expires in 1 hour.</p>`
    );

    return res.json({ message: "If this email exists, a reset link has been sent." });
  } catch (err) {
    return res.status(500).json({ message: "Forgot password failed", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ message: "token and password are required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select("+passwordHash");

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.passwordHash = await bcrypt.hash(String(password), 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    return res.status(500).json({ message: "Reset password failed", error: err.message });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: req.user.toSafeJSON() });
};

