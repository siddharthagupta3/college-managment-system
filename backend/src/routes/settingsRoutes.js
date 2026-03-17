const express = require("express");
const { requireAuth } = require("../middleware/auth");
const settingsController = require("../controllers/settingsController");

const router = express.Router();

router.get("/me", requireAuth, settingsController.getMySettings);
router.put("/me", requireAuth, settingsController.updateMySettings);

module.exports = router;
