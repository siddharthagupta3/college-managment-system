const Group = require("../models/Group");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { getIO } = require("../sockets/io");

async function getGroupIfMember(groupId, userId) {
  const group = await Group.findById(groupId);
  if (!group) return { ok: false, status: 404, message: "Group not found" };

  const isMember = group.members.some((m) => m.toString() === userId.toString());
  if (!isMember) return { ok: false, status: 403, message: "Not a member of this group" };

  return { ok: true, group };
}

exports.listGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const check = await getGroupIfMember(groupId, req.user._id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const limit = Math.min(Number(req.query.limit || 50), 200);
    const before = req.query.before ? new Date(req.query.before) : null;

    const filter = { group: groupId };
    if (before) filter.createdAt = { $lt: before };

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name username profile.avatarUrl verifiedBadge");

    return res.json({ messages: messages.reverse() });
  } catch (err) {
    return res.status(500).json({ message: "Fetch messages failed", error: err.message });
  }
};

exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text } = req.body || {};

    const check = await getGroupIfMember(groupId, req.user._id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    if (!text || !String(text).trim()) return res.status(400).json({ message: "text is required" });

    const message = await Message.create({
      group: groupId,
      sender: req.user._id,
      text: String(text).trim(),
      reactions: [],
    });

    await Group.updateOne(
      { _id: groupId },
      {
        $set: {
          lastMessageAt: message.createdAt,
          lastMessageText: message.text,
          lastMessageSender: req.user._id,
        },
      }
    );

    const populated = await Message.findById(message._id).populate(
      "sender",
      "name username profile.avatarUrl verifiedBadge"
    );

    // Notifications for all members except sender
    const memberIds = check.group.members.map((m) => m.toString()).filter((id) => id !== req.user._id.toString());
    if (memberIds.length) {
      const docs = memberIds.map((uid) => ({
        user: uid,
        type: "message",
        group: groupId,
        message: message._id,
      }));
      await Notification.insertMany(docs, { ordered: false });
    }

    const io = getIO();
    if (io) {
      io.to(`group:${groupId}`).emit("message:new", populated);
      memberIds.forEach((uid) => {
        io.to(`user:${uid}`).emit("notification:new", {
          type: "message",
          groupId,
          messageId: message._id.toString(),
          createdAt: message.createdAt,
        });
      });
    }

    return res.status(201).json({ message: populated });
  } catch (err) {
    return res.status(500).json({ message: "Send message failed", error: err.message });
  }
};

exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body || {};
    if (!emoji) return res.status(400).json({ message: "emoji is required" });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const check = await getGroupIfMember(message.group, req.user._id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const existingIdx = message.reactions.findIndex((r) => r.user.toString() === req.user._id.toString());
    if (existingIdx >= 0) {
      message.reactions[existingIdx].emoji = String(emoji);
    } else {
      message.reactions.push({ user: req.user._id, emoji: String(emoji) });
    }

    await message.save();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "name username profile.avatarUrl verifiedBadge"
    );

    const io = getIO();
    if (io) io.to(`group:${message.group.toString()}`).emit("message:updated", populated);

    return res.json({ message: populated });
  } catch (err) {
    return res.status(500).json({ message: "React failed", error: err.message });
  }
};

