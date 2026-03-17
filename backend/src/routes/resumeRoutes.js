const express = require("express");
const resumeController = require("../controllers/resumeController");

const router = express.Router();

router.post("/save", resumeController.saveResume);
router.get("/:id", resumeController.getResumeById);

module.exports = router;
