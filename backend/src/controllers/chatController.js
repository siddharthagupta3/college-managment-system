const mongoose = require("mongoose");
const ChatState = require("../models/ChatState");
const Group = require("../models/Group");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

function makeDirectKey(a, b) {
  const ids = [String(a), String(b)].sort();
  return `direct:${ids[0]}:${ids[1]}`;
}

exports.listChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const archived = String(req.query.archived || "false") === "true";

    const groups = await Group.find({ members: userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    const groupIds = groups.map((g) => g._id);

    const states = await ChatState.find({ user: userId, group: { $in: groupIds } }).lean();
    const stateByGroup = new Map(states.map((s) => [String(s.group), s]));

    const filteredGroups = groups.filter((g) => {
      const st = stateByGroup.get(String(g._id));
      return (st?.archived || false) === archived;
    });

    // Unread count based on lastReadAt
    const unreadCounts = await Promise.all(
      filteredGroups.map(async (g) => {
        const st = stateByGroup.get(String(g._id));
        const after = st?.lastReadAt;
        const filter = { group: g._id };
        if (after) filter.createdAt = { $gt: after };
        const count = await Message.countDocuments(filter);
        return [String(g._id), count];
      })
    );
    const unreadByGroup = new Map(unreadCounts);

    // Resolve direct chat display names/avatars
    const otherUserIds = filteredGroups
      .filter((g) => g.isDirect)
      .flatMap((g) => g.members.map((m) => String(m)))
      .filter((id) => id !== String(userId));

    const uniqueOtherIds = [...new Set(otherUserIds)];
    const others = uniqueOtherIds.length
      ? await User.find({ _id: { $in: uniqueOtherIds } }).select("name username profile.avatarUrl verifiedBadge").lean()
      : [];
    const otherById = new Map(others.map((u) => [String(u._id), u]));

    const chats = filteredGroups.map((g) => {
      const st = stateByGroup.get(String(g._id));
      let title = g.name;
      let avatarUrl = "";
      let verifiedBadge = false;

      if (g.isDirect) {
        const otherId = g.members.map(String).find((id) => id !== String(userId));
        const other = otherId ? otherById.get(String(otherId)) : null;
        if (other) {
          title = other.name || other.username || "User";
          avatarUrl = other.profile?.avatarUrl || "";
          verifiedBadge = Boolean(other.verifiedBadge);
        }
      }

      return {
        id: String(g._id),
        title,
        isDirect: Boolean(g.isDirect),
        lastMessageAt: g.lastMessageAt,
        lastMessageText: g.lastMessageText || "",
        unreadCount: unreadByGroup.get(String(g._id)) || 0,
        archived: Boolean(st?.archived),
        pinned: Boolean(st?.pinned),
        muted: Boolean(st?.muted),
        avatarUrl,
        verifiedBadge,
      };
    });

    return res.json({ chats });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list chats", error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const groupId = req.params.groupId;

    await ChatState.findOneAndUpdate(
      { user: userId, group: groupId },
      { $set: { lastReadAt: new Date() } },
      { upsert: true, new: true }
    );

    await Notification.updateMany(
      { user: userId, group: groupId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to mark read", error: err.message });
  }
};

exports.archive = async (req, res) => {
  try {
    const userId = req.user._id;
    const groupId = req.params.groupId;

    await ChatState.findOneAndUpdate(
      { user: userId, group: groupId },
      { $set: { archived: true } },
      { upsert: true, new: true }
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to archive", error: err.message });
  }
};

exports.unarchive = async (req, res) => {
  try {
    const userId = req.user._id;
    const groupId = req.params.groupId;

    await ChatState.findOneAndUpdate(
      { user: userId, group: groupId },
      { $set: { archived: false } },
      { upsert: true, new: true }
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to unarchive", error: err.message });
  }
};

exports.createDirect = async (req, res) => {
  try {
    const userId = req.user._id;
    const { userId: otherUserId } = req.body || {};
    if (!otherUserId) return res.status(400).json({ message: "userId is required" });
    if (!mongoose.isValidObjectId(otherUserId)) return res.status(400).json({ message: "Invalid userId" });
    if (String(otherUserId) === String(userId)) return res.status(400).json({ message: "Cannot chat with yourself" });

    const other = await User.findById(otherUserId).select("name username");
    if (!other) return res.status(404).json({ message: "User not found" });

    const directKey = makeDirectKey(userId, otherUserId);

    let group = await Group.findOne({ directKey });
    if (!group) {
      group = await Group.create({
        name: "Direct",
        createdBy: userId,
        members: [userId, otherUserId],
        lastMessageAt: null,
        lastMessageText: "",
        lastMessageSender: null,
        isDirect: true,
        directKey,
      });
    }

    return res.status(201).json({ groupId: String(group._id) });
  } catch (err) {
    // If unique index races, fetch existing
    if (String(err.message || "").includes("E11000")) {
      const { userId: otherUserId } = req.body || {};
      const directKey = makeDirectKey(req.user._id, otherUserId);
      const group = await Group.findOne({ directKey });
      if (group) return res.status(201).json({ groupId: String(group._id) });
    }
    return res.status(500).json({ message: "Failed to create direct chat", error: err.message });
  }
};

