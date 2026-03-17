const express = require("express");
const { requireAuth } = require("../middleware/auth");
const groupController = require("../controllers/groupController");

const router = express.Router();

// Everyone who is authenticated can create groups and manage members
router.get("/", requireAuth, groupController.listMyGroups);
router.post("/", requireAuth, groupController.createGroup);

router.get("/:groupId", requireAuth, groupController.getGroup);

router.post("/:groupId/members", requireAuth, groupController.addMember);
router.delete("/:groupId/members", requireAuth, groupController.removeMember);

module.exports = router;

