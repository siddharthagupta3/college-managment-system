const Group = require("../models/Group");
const User = require("../models/User");

async function assertMember(groupId, userId) {
  const group = await Group.findById(groupId);
  if (!group) return { ok: false, status: 404, message: "Group not found" };

  const isMember = group.members.some((m) => m.toString() === userId.toString());
  if (!isMember) return { ok: false, status: 403, message: "Not a member of this group" };

  return { ok: true, group };
}

exports.listMyGroups = async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).sort({ lastMessageAt: -1, updatedAt: -1 });
  return res.json({ groups });
};

exports.createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body || {};
    if (!name) return res.status(400).json({ message: "name is required" });

    const members = new Set([req.user._id.toString()]);
    if (Array.isArray(memberIds)) {
      memberIds.forEach((id) => {
        if (id) members.add(String(id));
      });
    }

    const group = await Group.create({
      name,
      createdBy: req.user._id,
      members: Array.from(members),
      lastMessageAt: null,
    });

    return res.status(201).json({ group });
  } catch (err) {
    return res.status(500).json({ message: "Create group failed", error: err.message });
  }
};

exports.getGroup = async (req, res) => {
  const check = await assertMember(req.params.groupId, req.user._id);
  if (!check.ok) return res.status(check.status).json({ message: check.message });

  const group = await Group.findById(req.params.groupId)
    .populate("createdBy", "name username profile.avatarUrl verifiedBadge")
    .populate("members", "name username profile.avatarUrl verifiedBadge");

  return res.json({ group });
};

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const check = await assertMember(req.params.groupId, req.user._id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message: "Target user not found" });

    await Group.updateOne(
      { _id: req.params.groupId },
      { $addToSet: { members: target._id } }
    );

    const group = await Group.findById(req.params.groupId);
    return res.json({ group });
  } catch (err) {
    return res.status(500).json({ message: "Add member failed", error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const check = await assertMember(req.params.groupId, req.user._id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message: "Target user not found" });

    await Group.updateOne({ _id: req.params.groupId }, { $pull: { members: target._id } });

    const group = await Group.findById(req.params.groupId);
    return res.json({ group });
  } catch (err) {
    return res.status(500).json({ message: "Remove member failed", error: err.message });
  }
};

