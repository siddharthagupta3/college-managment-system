const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    college: { type: String, default: "" },
    year: { type: String, default: "" },
    degree: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, default: "" },
    role: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    title: { type: String, default: "My Resume" },
    template: { type: String, default: "default" },
    theme: { type: String, default: "light" },
    fontFamily: { type: String, default: "Manrope" },
    templateCustom: { type: mongoose.Schema.Types.Mixed, default: {} },
    backgroundDesign: { type: String, default: "clean-paper" },
    colorPalette: { type: String, default: "classic-blue" },
    uiStyle: { type: String, default: "glass" },
    sectionOrder: {
      type: [String],
      default: ["about", "education", "experience", "skills"],
    },
    personal: {
      name: { type: String, default: "" },
      profession: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      linkedIn: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      imageDataUrl: { type: String, default: "" },
    },
    about: { type: String, default: "" },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    skills: { type: [String], default: [] },
    atsScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
