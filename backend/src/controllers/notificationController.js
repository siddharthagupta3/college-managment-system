const Notification = require("../models/Notification");

exports.listMyNotifications = async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const onlyUnread = String(req.query.unread || "false") === "true";

  const filter = { user: req.user._id };
  if (onlyUnread) filter.readAt = null;

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(limit);
  return res.json({ notifications });
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  return res.json({ ok: true });
};

