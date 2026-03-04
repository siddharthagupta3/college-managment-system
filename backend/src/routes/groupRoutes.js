const express = require("express");
const { requireAuth, requireRoles } = require("../middleware/auth");
const groupController = require("../controllers/groupController");

const router = express.Router();

router.get("/", requireAuth, groupController.listMyGroups);
router.post("/", requireAuth, requireRoles("admin", "faculty"), groupController.createGroup);

router.get("/:groupId", requireAuth, groupController.getGroup);

router.post("/:groupId/members", requireAuth, requireRoles("admin", "faculty"), groupController.addMember);
router.delete("/:groupId/members", requireAuth, requireRoles("admin", "faculty"), groupController.removeMember);

module.exports = router;

