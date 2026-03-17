const Resume = require("../models/Resume");

function computeAtsScore(payload) {
  const p = payload?.personal || {};
  let score = 0;

  if (p.name) score += 10;
  if (p.profession) score += 10;
  if (p.email) score += 8;
  if (p.phone) score += 8;
  if (p.address) score += 6;
  if (payload?.about && payload.about.length >= 60) score += 14;

  const eduCount = Array.isArray(payload?.education) ? payload.education.length : 0;
  const expCount = Array.isArray(payload?.experience) ? payload.experience.length : 0;
  const skillCount = Array.isArray(payload?.skills) ? payload.skills.length : 0;

  score += Math.min(eduCount * 8, 16);
  score += Math.min(expCount * 10, 20);
  score += Math.min(skillCount * 2, 14);

  const hasLinks = Number(Boolean(p.linkedIn)) + Number(Boolean(p.github)) + Number(Boolean(p.portfolio));
  score += Math.min(hasLinks * 4, 12);

  return Math.max(0, Math.min(100, score));
}

exports.saveResume = async (req, res) => {
  try {
    const payload = req.body || {};
    const atsScore = computeAtsScore(payload);

    const resume = await Resume.create({
      ...payload,
      atsScore,
    });

    return res.status(201).json({
      message: "Resume saved",
      resumeId: resume._id,
      atsScore: resume.atsScore,
    });
  } catch (err) {
    return res.status(500).json({ message: "Unable to save resume", error: err.message });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json({ resume });
  } catch (err) {
    return res.status(500).json({ message: "Unable to fetch resume", error: err.message });
  }
};
