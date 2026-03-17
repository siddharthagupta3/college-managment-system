const state = {
	currentStep: 1,
	template: "professional-wave",
	theme: "light",
	fontFamily: "Manrope",
	backgroundDesign: "clean-paper",
	colorPalette: "classic-blue",
	uiStyle: "glass",
	sectionOrder: ["about", "education", "experience", "skills", "languages", "achievements", "interests", "strengths", "portfolio"],
	personal: {
		name: "Sebastian Bennett",
		profession: "Product Designer",
		phone: "+91 98765 43210",
		email: "sebastian@portfolio.com",
		address: "Bengaluru, India",
		linkedIn: "",
		github: "",
		portfolio: "",
		imageDataUrl: "",
	},
	about:
		"Professional designer with a focus on clean interfaces, user-centered journeys, and measurable product outcomes.",
	education: [
		{
			college: "National Institute of Design",
			year: "2018 - 2022",
			degree: "B.Des in Interaction Design",
			description: "Specialized in human-centered systems and visual storytelling.",
		},
	],
	experience: [
		{
			company: "Nova Labs",
			role: "Senior Product Designer",
			duration: "2022 - Present",
			description:
				"Led a design system revamp improving product consistency and reducing engineering handoff issues.",
		},
	],
	skills: ["Figma", "Design Systems", "Wireframing", "User Research", "Prototyping"],
	languages: ["English", "Hindi", "French"],
	achievements: ["Improved workflow efficiency by 25%", "Reduced delivery defects across releases"],
	interests: ["Design Research", "Public Speaking", "Reading"],
	strengths: ["Leadership", "Communication", "Problem Solving"],
	portfolioItems: [
		{ title: "Studio Apartment Makeover", description: "Minimal interior redesign project" },
		{ title: "Office Space Refresh", description: "Workspace optimization and lighting" },
	],
	templateCustom: {
		"professional-wave": { bannerStyle: "classic", titleAlign: "center", showAvatarRing: true },
		"executive-sidebar": { sidebarTone: "navy", compactSpacing: false, showLanguages: true },
		"teal-split": { topBandHeight: "medium", leftPanelTone: "light", roundedAvatar: true },
		"student-mint": { mintStrength: "soft", showSkillDots: true, headerLayout: "wide" },
		"editorial-rose": { accentLevel: "soft", sidebarWidth: "medium", showLinks: true },
		"mono-accountant": { headingCase: "upper", dividerWeight: "thin", skillsColumns: "3" },
		"medical-column": { rightColumnWidth: "narrow", highlightTone: "coral", boldSectionHeaders: true },
		"crimson-education": { sidebarTone: "crimson", profileShape: "circle", showIcons: true },
		"brown-minimalist": { cardTone: "brown", sectionBar: "solid", compactMode: false },
		"purple-creator": { ratingStyle: "stars", sidebarShade: "deep", showLinks: true },
		"teal-interior-pro": { leftPanelShade: "ocean", competencyStyle: "dashes", showPortfolio: true },
		"green-impact-pro": { rightPanelShade: "green", skillMeter: "dashes", showAchievements: true },
	},
};

const el = {
	stepTabs: [...document.querySelectorAll(".step-tab")],
	stepPanels: [...document.querySelectorAll(".step-panel")],
	prevStepBtn: document.getElementById("prevStepBtn"),
	nextStepBtn: document.getElementById("nextStepBtn"),
	saveResumeBtn: document.getElementById("saveResumeBtn"),
	downloadPdfBtn: document.getElementById("downloadPdfBtn"),
	loadResumeBtn: document.getElementById("loadResumeBtn"),
	resumeIdInput: document.getElementById("resumeIdInput"),
	statusText: document.getElementById("statusText"),
	atsScore: document.getElementById("atsScore"),
	resumeDoc: document.getElementById("resume-preview") || document.getElementById("resumeDoc"),
	sectionOrderList: document.getElementById("sectionOrderList"),
	educationList: document.getElementById("educationList"),
	experienceList: document.getElementById("experienceList"),
	addEducationBtn: document.getElementById("addEducationBtn"),
	addExperienceBtn: document.getElementById("addExperienceBtn"),
	addSkillBtn: document.getElementById("addSkillBtn"),
	skillInput: document.getElementById("skillInput"),
	skillTags: document.getElementById("skillTags"),
	addLanguageBtn: document.getElementById("addLanguageBtn"),
	languageInput: document.getElementById("languageInput"),
	languageTags: document.getElementById("languageTags"),
	addInterestBtn: document.getElementById("addInterestBtn"),
	interestInput: document.getElementById("interestInput"),
	interestTags: document.getElementById("interestTags"),
	addStrengthBtn: document.getElementById("addStrengthBtn"),
	strengthInput: document.getElementById("strengthInput"),
	strengthTags: document.getElementById("strengthTags"),
	addAchievementBtn: document.getElementById("addAchievementBtn"),
	achievementInput: document.getElementById("achievementInput"),
	achievementTags: document.getElementById("achievementTags"),
	portfolioList: document.getElementById("portfolioList"),
	addPortfolioBtn: document.getElementById("addPortfolioBtn"),
	templateSelect: document.getElementById("templateSelect"),
	themeSelect: document.getElementById("themeSelect"),
	fontSelect: document.getElementById("fontSelect"),
	backgroundSelect: document.getElementById("backgroundSelect"),
	uiStyleSelect: document.getElementById("uiStyleSelect"),
	templateCustomSettings: document.getElementById("templateCustomSettings"),
	profileImage: document.getElementById("profileImage"),
};

const personalFields = [
	"name",
	"profession",
	"phone",
	"email",
	"address",
	"linkedIn",
	"github",
	"portfolio",
];

const PRESET_STORAGE_KEY = "resumeBuilderPresetSelectionV1";

function apiBase() {
	if (typeof window.API_BASE === "string" && window.API_BASE.trim()) {
		return window.API_BASE.replace(/\/$/, "");
	}
	return "http://localhost:5000/api";
}

function slugFont(font) {
	return font.toLowerCase().replace(/\s+/g, "-");
}

function showStatus(message, isError = false) {
	el.statusText.textContent = message;
	el.statusText.style.color = isError ? "#d64545" : "#1f9b5f";
}

function computeAtsScore() {
	const p = state.personal;
	let score = 0;
	if (p.name) score += 10;
	if (p.profession) score += 10;
	if (p.email) score += 8;
	if (p.phone) score += 8;
	if (p.address) score += 6;
	if (state.about && state.about.length >= 60) score += 14;
	score += Math.min(state.education.length * 8, 16);
	score += Math.min(state.experience.length * 10, 20);
	score += Math.min(state.skills.length * 2, 14);

	const links = Number(Boolean(p.linkedIn)) + Number(Boolean(p.github)) + Number(Boolean(p.portfolio));
	score += Math.min(links * 4, 12);

	const finalScore = Math.max(0, Math.min(100, score));
	el.atsScore.textContent = String(finalScore);
	return finalScore;
}

function escapeHtml(value) {
	return String(value || "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function linkBlock() {
	const links = [];
	if (state.personal.linkedIn) links.push(`<a href="${escapeHtml(state.personal.linkedIn)}" target="_blank" rel="noreferrer">LinkedIn</a>`);
	if (state.personal.github) links.push(`<a href="${escapeHtml(state.personal.github)}" target="_blank" rel="noreferrer">GitHub</a>`);
	if (state.personal.portfolio) links.push(`<a href="${escapeHtml(state.personal.portfolio)}" target="_blank" rel="noreferrer">Portfolio</a>`);
	return links.join(" • ");
}

function sectionHtml(sectionKey) {
	if (sectionKey === "about") {
		return `
			<section class="resume-section">
				<h3>About Me</h3>
				<p>${escapeHtml(state.about || "")}</p>
			</section>
		`;
	}

	if (sectionKey === "education") {
		return `
			<section class="resume-section">
				<h3>Education</h3>
				${state.education
					.map(
						(item) => `
					<div class="entry">
						<div class="entry-head">
							<span>${escapeHtml(item.degree || "")}</span>
							<span>${escapeHtml(item.year || "")}</span>
						</div>
						<div class="entry-sub">${escapeHtml(item.college || "")}</div>
						<p>${escapeHtml(item.description || "")}</p>
					</div>`
					)
					.join("")}
			</section>
		`;
	}

	if (sectionKey === "experience") {
		return `
			<section class="resume-section">
				<h3>Work Experience</h3>
				${state.experience
					.map(
						(item) => `
					<div class="entry">
						<div class="entry-head">
							<span>${escapeHtml(item.role || "")}</span>
							<span>${escapeHtml(item.duration || "")}</span>
						</div>
						<div class="entry-sub">${escapeHtml(item.company || "")}</div>
						<p>${escapeHtml(item.description || "")}</p>
					</div>`
					)
					.join("")}
			</section>
		`;
	}

	if (sectionKey === "languages") {
		return `
			<section class="resume-section">
				<h3>Languages</h3>
				<ul class="skills-list">
					${state.languages.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
				</ul>
			</section>
		`;
	}

	if (sectionKey === "achievements") {
		return `
			<section class="resume-section">
				<h3>Achievements</h3>
				<ul class="skills-list">
					${state.achievements.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
				</ul>
			</section>
		`;
	}

	if (sectionKey === "interests") {
		return `
			<section class="resume-section">
				<h3>Interests</h3>
				<ul class="skills-list">
					${state.interests.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
				</ul>
			</section>
		`;
	}

	if (sectionKey === "strengths") {
		return `
			<section class="resume-section">
				<h3>Strengths</h3>
				<ul class="skills-list">
					${state.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
				</ul>
			</section>
		`;
	}

	if (sectionKey === "portfolio") {
		return `
			<section class="resume-section">
				<h3>Portfolio</h3>
				${state.portfolioItems
					.map((item) => `<div class="entry"><div class="entry-head"><span>${escapeHtml(item.title || "Project")}</span></div><div class="entry-sub">${escapeHtml(item.description || "")}</div></div>`)
					.join("")}
			</section>
		`;
	}

	return `
		<section class="resume-section">
			<h3>Skills</h3>
			<ul class="skills-list">
				${state.skills.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
			</ul>
		</section>
	`;
}

function orderedSectionsHtml() {
	return state.sectionOrder.map((key) => sectionHtml(key)).join("");
}

function getTemplateCustomDefaults(template) {
	const defaults = {
		"professional-wave": { bannerStyle: "classic", titleAlign: "center", showAvatarRing: true },
		"executive-sidebar": { sidebarTone: "navy", compactSpacing: false, showLanguages: true },
		"teal-split": { topBandHeight: "medium", leftPanelTone: "light", roundedAvatar: true },
		"student-mint": { mintStrength: "soft", showSkillDots: true, headerLayout: "wide" },
		"editorial-rose": { accentLevel: "soft", sidebarWidth: "medium", showLinks: true },
		"mono-accountant": { headingCase: "upper", dividerWeight: "thin", skillsColumns: "3" },
		"medical-column": { rightColumnWidth: "narrow", highlightTone: "coral", boldSectionHeaders: true },
		"crimson-education": { sidebarTone: "crimson", profileShape: "circle", showIcons: true },
		"brown-minimalist": { cardTone: "brown", sectionBar: "solid", compactMode: false },
		"purple-creator": { ratingStyle: "stars", sidebarShade: "deep", showLinks: true },
		"teal-interior-pro": { leftPanelShade: "ocean", competencyStyle: "dashes", showPortfolio: true },
		"green-impact-pro": { rightPanelShade: "green", skillMeter: "dashes", showAchievements: true },
	};
	return defaults[template] || {};
}

function ensureTemplateCustom(template) {
	const defaults = getTemplateCustomDefaults(template);
	state.templateCustom[template] = {
		...defaults,
		...(state.templateCustom[template] || {}),
	};
	return state.templateCustom[template];
}

function applyTemplateCustomVariables() {
	const custom = ensureTemplateCustom(state.template);
	const vars = [
		"--tpl-accent",
		"--tpl-accent-soft",
		"--tpl-sidebar-width",
		"--tpl-divider",
		"--tpl-right-col",
		"--tpl-band-height",
		"--tpl-left-panel",
		"--tpl-mint-bg",
		"--tpl-crimson",
		"--tpl-brown-bg",
		"--tpl-purple",
		"--tpl-tealpro",
		"--tpl-greenpro",
	];
	vars.forEach((key) => el.resumeDoc.style.removeProperty(key));

	if (state.template === "editorial-rose") {
		const accentMap = { soft: "#e78f9c", medium: "#dc6f82", bold: "#ca4e67" };
		const softMap = { soft: "#f7e9ec", medium: "#f4dbe1", bold: "#f2cfd7" };
		const widthMap = { narrow: "34%", medium: "38%", wide: "42%" };
		el.resumeDoc.style.setProperty("--tpl-accent", accentMap[custom.accentLevel] || accentMap.soft);
		el.resumeDoc.style.setProperty("--tpl-accent-soft", softMap[custom.accentLevel] || softMap.soft);
		el.resumeDoc.style.setProperty("--tpl-sidebar-width", widthMap[custom.sidebarWidth] || widthMap.medium);
	}

	if (state.template === "mono-accountant") {
		const dividerMap = { thin: "1px", medium: "2px", bold: "3px" };
		el.resumeDoc.style.setProperty("--tpl-divider", dividerMap[custom.dividerWeight] || dividerMap.thin);
	}

	if (state.template === "medical-column") {
		const colMap = { narrow: "36%", medium: "40%", wide: "44%" };
		const toneMap = { coral: "#e48a8a", blue: "#6392d6", green: "#56a778" };
		el.resumeDoc.style.setProperty("--tpl-right-col", colMap[custom.rightColumnWidth] || colMap.narrow);
		el.resumeDoc.style.setProperty("--tpl-accent", toneMap[custom.highlightTone] || toneMap.coral);
	}

	if (state.template === "teal-split") {
		const bandMap = { small: "26px", medium: "34px", large: "46px" };
		const panelMap = { light: "#eaf1f4", teal: "#d7ecef", gray: "#edf0f2" };
		el.resumeDoc.style.setProperty("--tpl-band-height", bandMap[custom.topBandHeight] || bandMap.medium);
		el.resumeDoc.style.setProperty("--tpl-left-panel", panelMap[custom.leftPanelTone] || panelMap.light);
	}

	if (state.template === "student-mint") {
		const mintMap = { soft: "#51e1b1", medium: "#3fd3a0", bold: "#28bf87" };
		el.resumeDoc.style.setProperty("--tpl-mint-bg", mintMap[custom.mintStrength] || mintMap.soft);
	}

	if (state.template === "crimson-education") {
		const toneMap = { crimson: "#b63a47", wine: "#8c2a3b", navy: "#2c3f66" };
		el.resumeDoc.style.setProperty("--tpl-crimson", toneMap[custom.sidebarTone] || toneMap.crimson);
	}

	if (state.template === "brown-minimalist") {
		const toneMap = { brown: "#f4ece2", sand: "#f7f1ea", gray: "#efefef" };
		el.resumeDoc.style.setProperty("--tpl-brown-bg", toneMap[custom.cardTone] || toneMap.brown);
	}

	if (state.template === "purple-creator") {
		const shadeMap = { deep: "#7a4cd4", medium: "#8d63dc", soft: "#a17be4" };
		el.resumeDoc.style.setProperty("--tpl-purple", shadeMap[custom.sidebarShade] || shadeMap.deep);
	}

	if (state.template === "teal-interior-pro") {
		const shadeMap = { ocean: "#0f6075", ink: "#0e4d5f", navy: "#1a4f6e" };
		el.resumeDoc.style.setProperty("--tpl-tealpro", shadeMap[custom.leftPanelShade] || shadeMap.ocean);
	}

	if (state.template === "green-impact-pro") {
		const shadeMap = { green: "#4b9258", forest: "#3e7f4b", olive: "#597e4f" };
		el.resumeDoc.style.setProperty("--tpl-greenpro", shadeMap[custom.rightPanelShade] || shadeMap.green);
	}
}

function renderTemplateCustomSettings() {
	if (!el.templateCustomSettings) return;
	const custom = ensureTemplateCustom(state.template);
	let fields = [];

	if (state.template === "professional-wave") {
		fields = [
			{ key: "bannerStyle", label: "Banner Style", type: "select", options: [{ v: "classic", t: "Classic Wave" }, { v: "smooth", t: "Smooth Wave" }] },
			{ key: "titleAlign", label: "Title Align", type: "select", options: [{ v: "center", t: "Center" }, { v: "left", t: "Left" }] },
			{ key: "showAvatarRing", label: "Show Avatar Ring", type: "checkbox" },
		];
	} else if (state.template === "executive-sidebar") {
		fields = [
			{ key: "sidebarTone", label: "Sidebar Tone", type: "select", options: [{ v: "navy", t: "Navy" }, { v: "charcoal", t: "Charcoal" }, { v: "plum", t: "Plum" }] },
			{ key: "compactSpacing", label: "Compact Spacing", type: "checkbox" },
			{ key: "showLanguages", label: "Show Languages", type: "checkbox" },
		];
	} else if (state.template === "teal-split") {
		fields = [
			{ key: "topBandHeight", label: "Top Band Height", type: "select", options: [{ v: "small", t: "Small" }, { v: "medium", t: "Medium" }, { v: "large", t: "Large" }] },
			{ key: "leftPanelTone", label: "Left Panel Tone", type: "select", options: [{ v: "light", t: "Light" }, { v: "teal", t: "Teal" }, { v: "gray", t: "Gray" }] },
			{ key: "roundedAvatar", label: "Rounded Avatar", type: "checkbox" },
		];
	} else if (state.template === "student-mint") {
		fields = [
			{ key: "mintStrength", label: "Mint Strength", type: "select", options: [{ v: "soft", t: "Soft" }, { v: "medium", t: "Medium" }, { v: "bold", t: "Bold" }] },
			{ key: "showSkillDots", label: "Show Skill Bullets", type: "checkbox" },
			{ key: "headerLayout", label: "Header Layout", type: "select", options: [{ v: "wide", t: "Wide" }, { v: "compact", t: "Compact" }] },
		];
	} else if (state.template === "editorial-rose") {
		fields = [
			{ key: "accentLevel", label: "Accent Intensity", type: "select", options: [{ v: "soft", t: "Soft" }, { v: "medium", t: "Medium" }, { v: "bold", t: "Bold" }] },
			{ key: "sidebarWidth", label: "Sidebar Width", type: "select", options: [{ v: "narrow", t: "Narrow" }, { v: "medium", t: "Medium" }, { v: "wide", t: "Wide" }] },
			{ key: "showLinks", label: "Show Social Link", type: "checkbox" },
		];
	} else if (state.template === "mono-accountant") {
		fields = [
			{ key: "headingCase", label: "Heading Style", type: "select", options: [{ v: "upper", t: "UPPERCASE" }, { v: "title", t: "Title Case" }] },
			{ key: "dividerWeight", label: "Divider Weight", type: "select", options: [{ v: "thin", t: "Thin" }, { v: "medium", t: "Medium" }, { v: "bold", t: "Bold" }] },
			{ key: "skillsColumns", label: "Skills Columns", type: "select", options: [{ v: "2", t: "2 Columns" }, { v: "3", t: "3 Columns" }] },
		];
	} else if (state.template === "medical-column") {
		fields = [
			{ key: "rightColumnWidth", label: "Right Column Width", type: "select", options: [{ v: "narrow", t: "Narrow" }, { v: "medium", t: "Medium" }, { v: "wide", t: "Wide" }] },
			{ key: "highlightTone", label: "Highlight Color", type: "select", options: [{ v: "coral", t: "Coral" }, { v: "blue", t: "Blue" }, { v: "green", t: "Green" }] },
			{ key: "boldSectionHeaders", label: "Bold Section Headers", type: "checkbox" },
		];
	} else if (state.template === "crimson-education") {
		fields = [
			{ key: "sidebarTone", label: "Sidebar Tone", type: "select", options: [{ v: "crimson", t: "Crimson" }, { v: "wine", t: "Wine" }, { v: "navy", t: "Navy" }] },
			{ key: "profileShape", label: "Profile Photo", type: "select", options: [{ v: "circle", t: "Circle" }, { v: "rounded", t: "Rounded" }] },
			{ key: "showIcons", label: "Show Contact Icons", type: "checkbox" },
		];
	} else if (state.template === "brown-minimalist") {
		fields = [
			{ key: "cardTone", label: "Card Tone", type: "select", options: [{ v: "brown", t: "Brown" }, { v: "sand", t: "Sand" }, { v: "gray", t: "Gray" }] },
			{ key: "sectionBar", label: "Section Bar", type: "select", options: [{ v: "solid", t: "Solid" }, { v: "thin", t: "Thin" }] },
			{ key: "compactMode", label: "Compact Spacing", type: "checkbox" },
		];
	} else if (state.template === "purple-creator") {
		fields = [
			{ key: "ratingStyle", label: "Skill Meter", type: "select", options: [{ v: "stars", t: "Stars" }, { v: "dots", t: "Dots" }] },
			{ key: "sidebarShade", label: "Sidebar Shade", type: "select", options: [{ v: "deep", t: "Deep" }, { v: "medium", t: "Medium" }, { v: "soft", t: "Soft" }] },
			{ key: "showLinks", label: "Show Social Links", type: "checkbox" },
		];
	} else if (state.template === "teal-interior-pro") {
		fields = [
			{ key: "leftPanelShade", label: "Left Panel Shade", type: "select", options: [{ v: "ocean", t: "Ocean" }, { v: "ink", t: "Ink" }, { v: "navy", t: "Navy" }] },
			{ key: "competencyStyle", label: "Competency Style", type: "select", options: [{ v: "dashes", t: "Dashed" }, { v: "solid", t: "Solid" }] },
			{ key: "showPortfolio", label: "Show Portfolio Cards", type: "checkbox" },
		];
	} else if (state.template === "green-impact-pro") {
		fields = [
			{ key: "rightPanelShade", label: "Right Panel Shade", type: "select", options: [{ v: "green", t: "Green" }, { v: "forest", t: "Forest" }, { v: "olive", t: "Olive" }] },
			{ key: "skillMeter", label: "Skill Meter", type: "select", options: [{ v: "dashes", t: "Dashes" }, { v: "dots", t: "Dots" }] },
			{ key: "showAchievements", label: "Show Achievements", type: "checkbox" },
		];
	}

	if (!fields.length) {
		el.templateCustomSettings.innerHTML = '<p class="custom-settings-empty">No custom settings for this template.</p>';
		return;
	}

	el.templateCustomSettings.innerHTML = fields
		.map((field) => {
			if (field.type === "checkbox") {
				return `<label class="custom-setting-row checkbox"><input type="checkbox" data-setting-key="${field.key}" ${custom[field.key] ? "checked" : ""} /> ${field.label}</label>`;
			}
			return `<label class="custom-setting-row">${field.label}<select data-setting-key="${field.key}">${field.options
				.map((option) => `<option value="${option.v}" ${String(custom[field.key]) === option.v ? "selected" : ""}>${option.t}</option>`)
				.join("")}</select></label>`;
		})
		.join("");

	el.templateCustomSettings.querySelectorAll("[data-setting-key]").forEach((input) => {
		input.addEventListener("change", () => {
			const key = input.dataset.settingKey;
			const value = input.type === "checkbox" ? input.checked : input.value;
			state.templateCustom[state.template][key] = value;
			renderPreview();
		});
	});
}

function renderPreview() {
	computeAtsScore();

	const classNames = [
		"resume-doc",
		`template-${state.template}`,
		`theme-${state.theme}`,
		`bg-${state.backgroundDesign}`,
		`palette-${state.colorPalette}`,
		`font-${slugFont(state.fontFamily)}`,
	];

	const custom = ensureTemplateCustom(state.template);
	if (state.template === "professional-wave") {
		classNames.push(`wave-${custom.bannerStyle || "classic"}`);
		classNames.push(`wave-title-${custom.titleAlign || "center"}`);
		if (!custom.showAvatarRing) classNames.push("wave-no-avatar-ring");
	}
	if (state.template === "executive-sidebar") {
		classNames.push(`exec-tone-${custom.sidebarTone || "navy"}`);
		if (custom.compactSpacing) classNames.push("exec-compact");
		if (!custom.showLanguages) classNames.push("exec-hide-languages");
	}
	if (state.template === "teal-split") {
		if (!custom.roundedAvatar) classNames.push("teal-square-avatar");
	}
	if (state.template === "student-mint") {
		if (!custom.showSkillDots) classNames.push("student-no-dots");
		classNames.push(`student-header-${custom.headerLayout || "wide"}`);
	}
	if (state.template === "mono-accountant") {
		classNames.push(`mono-heading-${custom.headingCase || "upper"}`);
		classNames.push(`mono-skills-${custom.skillsColumns || "3"}`);
	}
	if (state.template === "medical-column") {
		if (!custom.boldSectionHeaders) classNames.push("medical-light-headers");
	}
	if (state.template === "crimson-education") {
		classNames.push(`crimson-tone-${custom.sidebarTone || "crimson"}`);
		classNames.push(`crimson-profile-${custom.profileShape || "circle"}`);
		if (!custom.showIcons) classNames.push("crimson-no-icons");
	}
	if (state.template === "brown-minimalist") {
		classNames.push(`brown-tone-${custom.cardTone || "brown"}`);
		classNames.push(`brown-bar-${custom.sectionBar || "solid"}`);
		if (custom.compactMode) classNames.push("brown-compact");
	}
	if (state.template === "purple-creator") {
		classNames.push(`purple-shade-${custom.sidebarShade || "deep"}`);
		classNames.push(`purple-rating-${custom.ratingStyle || "stars"}`);
		if (!custom.showLinks) classNames.push("purple-hide-links");
	}
	if (state.template === "teal-interior-pro") {
		classNames.push(`tealpro-shade-${custom.leftPanelShade || "ocean"}`);
		classNames.push(`tealpro-competency-${custom.competencyStyle || "dashes"}`);
		if (!custom.showPortfolio) classNames.push("tealpro-hide-portfolio");
	}
	if (state.template === "green-impact-pro") {
		classNames.push(`greenpro-shade-${custom.rightPanelShade || "green"}`);
		classNames.push(`greenpro-meter-${custom.skillMeter || "dashes"}`);
		if (!custom.showAchievements) classNames.push("greenpro-hide-achievements");
	}

	el.resumeDoc.className = classNames.join(" ");
	applyTemplateCustomVariables();

	const header = `
		<header class="resume-header">
			<div>
				<h2 class="resume-name">${escapeHtml(state.personal.name || "Your Name")}</h2>
				<p class="resume-role">${escapeHtml(state.personal.profession || "Your Profession")}</p>
				<div class="contact-row">
					<span>${escapeHtml(state.personal.phone || "")}</span>
					<span>${escapeHtml(state.personal.email || "")}</span>
					<span>${escapeHtml(state.personal.address || "")}</span>
					${linkBlock()}
				</div>
			</div>
			${state.personal.imageDataUrl ? `<img class="resume-avatar" src="${state.personal.imageDataUrl}" alt="Profile" />` : ""}
		</header>
	`;

	const waveHeader = `
		<section class="wave-hero">
			<div class="wave-top">
				<div class="wave-contact-mini">
					<span>${escapeHtml(state.personal.address || "City, Country")}</span>
					<span>${escapeHtml(state.personal.email || "email@example.com")}</span>
					<span>${escapeHtml(state.personal.phone || "+00 00000 00000")}</span>
				</div>
				<div class="wave-avatar-ring">
					${state.personal.imageDataUrl ? `<img class="wave-avatar" src="${state.personal.imageDataUrl}" alt="Profile" />` : `<div class="wave-avatar-fallback">${escapeHtml((state.personal.name || "U").slice(0, 1).toUpperCase())}</div>`}
				</div>
			</div>
			<h2 class="wave-resume-title">Professional Resume for Job</h2>
			<div class="wave-identity">
				<p><strong>${escapeHtml(state.personal.name || "Your Name")}</strong></p>
				<p>${escapeHtml(state.personal.profession || "Your Profession")}</p>
				<p>${escapeHtml(state.personal.address || "")}</p>
				<p>${escapeHtml(state.personal.email || "")}</p>
				<p>${escapeHtml(state.personal.phone || "")}</p>
			</div>
		</section>
	`;

	const fallbackSkills = state.skills.length ? state.skills : ["Communication", "Problem Solving", "Teamwork", "Leadership"];
	const normalizedLanguages = state.languages.length ? state.languages : ["English", "Hindi", "French"];
	const interestsList = state.interests.length ? state.interests : ["Running", "Reading", "Public Speaking"];
	const strengthsList = state.strengths.length ? state.strengths : ["Willingness", "Wisdom", "Zeal", "Ingenuity"];
	const achievementsList = state.achievements.length ? state.achievements : ["Streamlined workflows and improved delivery quality."];
	const portfolioCards = state.portfolioItems.length
		? state.portfolioItems
		: [
				{ title: "Portfolio Shot", description: "" },
				{ title: "Interior Mood", description: "" },
				{ title: "Living Space", description: "" },
		  ];
	const experienceItems = state.experience.length
		? state.experience
		: [{ company: "Company Name", role: "Role", duration: "Year - Year", description: "Add your professional achievements here." }];
	const educationItems = state.education.length
		? state.education
		: [{ college: "University Name", degree: "Degree", year: "Year", description: "Add your education details." }];

	const toBullets = (text) => {
		const source = String(text || "").trim();
		if (!source) return ["Add your impact-driven bullet points here."];
		const chunks = source
			.split(/\.(\s+|$)/)
			.map((item) => item.trim())
			.filter(Boolean);
		return chunks.length ? chunks : [source];
	};

	if (state.template === "executive-sidebar") {
		el.resumeDoc.innerHTML = `
			<section class="exec-shell">
				<aside class="exec-left">
					${state.personal.imageDataUrl ? `<img class="exec-avatar" src="${state.personal.imageDataUrl}" alt="Profile" />` : `<div class="exec-avatar exec-avatar-fallback">${escapeHtml((state.personal.name || "U").slice(0, 1).toUpperCase())}</div>`}
					<div class="exec-block">
						<h4>Contact</h4>
						<p>${escapeHtml(state.personal.address || "Your Address")}</p>
						<p>${escapeHtml(state.personal.phone || "+00 00000 00000")}</p>
						<p>${escapeHtml(state.personal.email || "email@example.com")}</p>
					</div>
					<div class="exec-block">
						<h4>Skills</h4>
						<ul>${fallbackSkills.slice(0, 8).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
					</div>
					<div class="exec-block">
						<h4>Languages</h4>
						<ul>${normalizedLanguages.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
					</div>
				</aside>
				<div class="exec-main">
					<h2 class="exec-name">${escapeHtml(state.personal.name || "Your Name")}</h2>
					<p class="exec-role">${escapeHtml(state.personal.profession || "Your Role")}</p>
					<section class="exec-section">
						<h3>Profile</h3>
						<p>${escapeHtml(state.about || "Write your profile summary here.")}</p>
					</section>
					<section class="exec-section">
						<h3>Work Experience</h3>
						${experienceItems
							.map(
								(item) => `
							<div class="exec-entry">
								<div class="exec-entry-head">
									<strong>${escapeHtml(item.role || "Role")}</strong>
									<span>${escapeHtml(item.duration || "Duration")}</span>
								</div>
								<div class="exec-entry-sub">${escapeHtml(item.company || "Company")}</div>
								<ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
							</div>`
							)
							.join("")}
					</section>
					<section class="exec-section">
						<h3>Education</h3>
						${educationItems
							.map(
								(item) => `
							<div class="exec-entry">
								<div class="exec-entry-head">
									<strong>${escapeHtml(item.degree || "Degree")}</strong>
									<span>${escapeHtml(item.year || "Year")}</span>
								</div>
								<div class="exec-entry-sub">${escapeHtml(item.college || "College")}</div>
							</div>`
							)
							.join("")}
					</section>
				</div>
			</section>
		`;
		return;
	}

	if (state.template === "teal-split") {
		el.resumeDoc.innerHTML = `
			<section class="teal-shell">
				<header class="teal-head">
					${state.personal.imageDataUrl ? `<img class="teal-avatar" src="${state.personal.imageDataUrl}" alt="Profile" />` : `<div class="teal-avatar teal-avatar-fallback">${escapeHtml((state.personal.name || "U").slice(0, 1).toUpperCase())}</div>`}
					<div>
						<p class="teal-name">${escapeHtml(state.personal.name || "Your Name")}</p>
						<p class="teal-role">${escapeHtml(state.personal.profession || "Job Title")}</p>
					</div>
				</header>
				<div class="teal-grid">
					<aside class="teal-left">
						<section class="teal-section"><h3>Contact</h3><p>${escapeHtml(state.personal.email || "email@example.com")}</p><p>${escapeHtml(state.personal.phone || "+00 00000 00000")}</p><p>${escapeHtml(state.personal.address || "Address")}</p></section>
						<section class="teal-section"><h3>Profile Summary</h3><p>${escapeHtml(state.about || "Add your profile summary.")}</p></section>
						<section class="teal-section"><h3>Skills</h3><ul>${fallbackSkills.slice(0, 7).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
					</aside>
					<div class="teal-main">
						<section class="teal-section"><h3>Professional Experience</h3>
						${experienceItems
							.map(
								(item) => `<div class="teal-entry"><strong>${escapeHtml(item.company || "Company")}</strong><p>${escapeHtml(item.role || "Role")} • ${escapeHtml(item.duration || "Duration")}</p><ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></div>`
							)
							.join("")}
						</section>
						<section class="teal-section"><h3>Education</h3>
						${educationItems
							.map(
								(item) => `<div class="teal-entry"><strong>${escapeHtml(item.degree || "Degree")}</strong><p>${escapeHtml(item.college || "College")} • ${escapeHtml(item.year || "Year")}</p></div>`
							)
							.join("")}
						</section>
					</div>
				</div>
			</section>
		`;
		return;
	}

	if (state.template === "student-mint") {
		el.resumeDoc.innerHTML = `
			<section class="student-shell">
				<header class="student-head">
					${state.personal.imageDataUrl ? `<img class="student-avatar" src="${state.personal.imageDataUrl}" alt="Profile" />` : `<div class="student-avatar student-avatar-fallback">${escapeHtml((state.personal.name || "S").slice(0, 1).toUpperCase())}</div>`}
					<div>
						<h2>${escapeHtml(state.personal.name || "Student Name")}</h2>
						<p>${escapeHtml(state.personal.profession || "Student")}</p>
						<div class="student-contact">${escapeHtml(state.personal.address || "Address")} • ${escapeHtml(state.personal.phone || "Phone")} • ${escapeHtml(state.personal.email || "Email")}</div>
					</div>
				</header>
				<div class="student-grid">
					<aside>
						<section class="student-section"><h3>Skills</h3><ul>${fallbackSkills.slice(0, 6).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
						<section class="student-section"><h3>Languages</h3><ul>${normalizedLanguages.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
					</aside>
					<div>
						<section class="student-section"><h3>Profile</h3><p>${escapeHtml(state.about || "Student profile summary")}</p></section>
						<section class="student-section"><h3>Employment History</h3>
						${experienceItems
							.map(
								(item) => `<div class="student-entry"><strong>${escapeHtml(item.role || "Role")}, ${escapeHtml(item.company || "Company")}</strong><p>${escapeHtml(item.duration || "Duration")}</p><ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></div>`
							)
							.join("")}
						</section>
						<section class="student-section"><h3>Education</h3>
						${educationItems
							.map(
								(item) => `<div class="student-entry"><strong>${escapeHtml(item.degree || "Degree")}</strong><p>${escapeHtml(item.college || "College")} • ${escapeHtml(item.year || "Year")}</p></div>`
							)
							.join("")}
						</section>
					</div>
				</div>
			</section>
		`;
		return;
	}

	if (state.template === "editorial-rose") {
		el.resumeDoc.innerHTML = `
			<section class="rose-shell">
				<aside class="rose-left">
					<h2 class="rose-name">${escapeHtml(state.personal.name || "Your Name")}</h2>
					<p class="rose-role">${escapeHtml(state.personal.profession || "Professional Role")}</p>
					<section class="rose-block">
						<h4>Contact</h4>
						<p>${escapeHtml(state.personal.email || "email@example.com")}</p>
						<p>${escapeHtml(state.personal.phone || "+00 00000 00000")}</p>
						<p>${escapeHtml(state.personal.address || "Address")}</p>
						${custom.showLinks && state.personal.linkedIn ? `<p>${escapeHtml(state.personal.linkedIn)}</p>` : ""}
					</section>
					<section class="rose-block">
						<h4>Education</h4>
						${educationItems.slice(0, 2).map((item) => `<p><strong>${escapeHtml(item.degree || "Degree")}</strong><br />${escapeHtml(item.college || "College")}<br />${escapeHtml(item.year || "Year")}</p>`).join("")}
					</section>
					<section class="rose-block">
						<h4>Skills</h4>
						<ul>${fallbackSkills.slice(0, 8).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
					</section>
				</aside>
				<div class="rose-main">
					<section class="rose-section">
						<h3>Work Experience</h3>
						${experienceItems
							.map(
								(item) => `<article class="rose-entry"><strong>${escapeHtml(item.role || "Role")}</strong><p class="rose-company">${escapeHtml(item.company || "Company")}</p><p class="rose-duration">${escapeHtml(item.duration || "Duration")}</p><ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></article>`
							)
							.join("")}
					</section>
				</div>
			</section>
		`;
		return;
	}

	if (state.template === "mono-accountant") {
		el.resumeDoc.innerHTML = `
			<section class="mono-shell">
				<header class="mono-head">
					<h2>${escapeHtml(state.personal.name || "Your Name")}</h2>
					<p>${escapeHtml(state.personal.profession || "Professional")}</p>
					<div class="mono-contact">${escapeHtml(state.personal.phone || "Phone")} • ${escapeHtml(state.personal.email || "Email")} • ${escapeHtml(state.personal.address || "Address")}</div>
				</header>
				<section class="mono-section">
					<h3>About Me</h3>
					<p>${escapeHtml(state.about || "Add your summary.")}</p>
				</section>
				<section class="mono-section">
					<h3>Education</h3>
					${educationItems.map((item) => `<article class="mono-entry"><p class="mono-sub">${escapeHtml(item.college || "College")} | ${escapeHtml(item.year || "Year")}</p><strong>${escapeHtml(item.degree || "Degree")}</strong><p>${escapeHtml(item.description || "")}</p></article>`).join("")}
				</section>
				<section class="mono-section">
					<h3>Work Experience</h3>
					${experienceItems.map((item) => `<article class="mono-entry"><p class="mono-sub">${escapeHtml(item.company || "Company")} | ${escapeHtml(item.duration || "Duration")}</p><strong>${escapeHtml(item.role || "Role")}</strong><p>${escapeHtml(item.description || "")}</p></article>`).join("")}
				</section>
				<section class="mono-section">
					<h3>Skills</h3>
					<ul class="mono-skills-list">${fallbackSkills.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
				</section>
			</section>
		`;
		return;
	}

	if (state.template === "medical-column") {
		el.resumeDoc.innerHTML = `
			<section class="medical-shell">
				<header class="medical-head">
					<h2>${escapeHtml(state.personal.name || "Your Name")}</h2>
					<p>${escapeHtml(state.personal.profession || "Medical Professional")}</p>
					<div>${escapeHtml(state.personal.email || "email@example.com")} • ${escapeHtml(state.personal.phone || "Phone")} • ${escapeHtml(state.personal.address || "Address")}</div>
				</header>
				<div class="medical-grid">
					<section class="medical-main">
						<h3>Work Experience</h3>
						${experienceItems.map((item) => `<article class="medical-entry"><strong>${escapeHtml(item.role || "Role")}</strong><p class="medical-company">${escapeHtml(item.company || "Company")}</p><p>${escapeHtml(item.duration || "Duration")}</p><ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></article>`).join("")}
					</section>
					<aside class="medical-side">
						<section><h3>Education</h3>${educationItems.map((item) => `<p><strong>${escapeHtml(item.degree || "Degree")}</strong><br />${escapeHtml(item.college || "College")}<br />${escapeHtml(item.year || "Year")}</p>`).join("")}</section>
						<section><h3>Skills</h3><ul>${fallbackSkills.slice(0, 9).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
						<section><h3>Activities</h3><p>${escapeHtml(state.about || "Add achievements and activities")}</p></section>
					</aside>
				</div>
			</section>
		`;
		return;
	}

	if (state.template === "crimson-education") {
		el.resumeDoc.innerHTML = `
			<section class="crimson-shell">
				<aside class="crimson-left">
					${state.personal.imageDataUrl ? `<img class="crimson-avatar" src="${state.personal.imageDataUrl}" alt="Profile" />` : `<div class="crimson-avatar crimson-avatar-fallback">${escapeHtml((state.personal.name || "C").slice(0, 1).toUpperCase())}</div>`}
					<h2>${escapeHtml(state.personal.name || "Your Name")}</h2>
					<p class="crimson-role">${escapeHtml(state.personal.profession || "Professional")}</p>
					<section class="crimson-block">
						<h4>Contact</h4>
						<p>${custom.showIcons ? "@ " : ""}${escapeHtml(state.personal.email || "email@example.com")}</p>
						<p>${custom.showIcons ? "# " : ""}${escapeHtml(state.personal.phone || "Phone")}</p>
						<p>${custom.showIcons ? "* " : ""}${escapeHtml(state.personal.address || "Address")}</p>
					</section>
					<section class="crimson-block">
						<h4>Skills</h4>
						<ul>${fallbackSkills.slice(0, 8).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
					</section>
				</aside>
				<div class="crimson-main">
					<section class="crimson-section"><h3>Profile</h3><p>${escapeHtml(state.about || "Add your professional summary.")}</p></section>
					<section class="crimson-section"><h3>Work Experience</h3>
					${experienceItems.map((item) => `<article class="crimson-entry"><strong>${escapeHtml(item.role || "Role")}</strong><p class="crimson-sub">${escapeHtml(item.company || "Company")} • ${escapeHtml(item.duration || "Duration")}</p><ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></article>`).join("")}
					</section>
					<section class="crimson-section"><h3>Education</h3>
					${educationItems.map((item) => `<article class="crimson-entry"><strong>${escapeHtml(item.degree || "Degree")}</strong><p class="crimson-sub">${escapeHtml(item.college || "College")} • ${escapeHtml(item.year || "Year")}</p></article>`).join("")}
					</section>
				</div>
			</section>
		`;
		return;
	}

	if (state.template === "brown-minimalist") {
		el.resumeDoc.innerHTML = `
			<section class="brown-shell">
				<header class="brown-head">
					<h2>${escapeHtml(state.personal.name || "Your Name")}</h2>
					<p>${escapeHtml(state.personal.profession || "Professional")}</p>
					<div>${escapeHtml(state.personal.phone || "Phone")} • ${escapeHtml(state.personal.email || "Email")} • ${escapeHtml(state.personal.address || "Address")}</div>
				</header>
				<section class="brown-card">
					<h3>Summary</h3>
					<p>${escapeHtml(state.about || "Write your short professional summary.")}</p>
				</section>
				<section class="brown-card">
					<h3>Experience</h3>
					${experienceItems.map((item) => `<article class="brown-entry"><strong>${escapeHtml(item.role || "Role")}</strong><p>${escapeHtml(item.company || "Company")} • ${escapeHtml(item.duration || "Duration")}</p><ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></article>`).join("")}
				</section>
				<section class="brown-card">
					<h3>Education</h3>
					${educationItems.map((item) => `<article class="brown-entry"><strong>${escapeHtml(item.degree || "Degree")}</strong><p>${escapeHtml(item.college || "College")} • ${escapeHtml(item.year || "Year")}</p></article>`).join("")}
				</section>
				<section class="brown-card">
					<h3>Skills</h3>
					<ul class="brown-skills">${fallbackSkills.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
				</section>
			</section>
		`;
		return;
	}

	if (state.template === "purple-creator") {
		const skillMeter = fallbackSkills
			.slice(0, 7)
			.map((item) => `<li><span>${escapeHtml(item)}</span><span class="purple-meter" aria-hidden="true"></span></li>`)
			.join("");

		el.resumeDoc.innerHTML = `
			<section class="purple-shell">
				<aside class="purple-left">
					<h2>${escapeHtml(state.personal.name || "Your Name")}</h2>
					<p>${escapeHtml(state.personal.profession || "Creative Professional")}</p>
					<section><h4>Contact</h4><p>${escapeHtml(state.personal.phone || "Phone")}</p><p>${escapeHtml(state.personal.email || "Email")}</p><p>${escapeHtml(state.personal.address || "Address")}</p></section>
					<section class="purple-links"><h4>Links</h4><p>${escapeHtml(state.personal.linkedIn || "LinkedIn")}</p><p>${escapeHtml(state.personal.github || "GitHub")}</p><p>${escapeHtml(state.personal.portfolio || "Portfolio")}</p></section>
				</aside>
				<div class="purple-main">
					<section class="purple-section"><h3>About Me</h3><p>${escapeHtml(state.about || "Add your creative summary.")}</p></section>
					<section class="purple-section"><h3>Projects & Experience</h3>
					${experienceItems.map((item) => `<article class="purple-entry"><strong>${escapeHtml(item.role || "Role")}</strong><p>${escapeHtml(item.company || "Company")} • ${escapeHtml(item.duration || "Duration")}</p><p>${escapeHtml(item.description || "")}</p></article>`).join("")}
					</section>
					<section class="purple-section"><h3>Education</h3>
					${educationItems.map((item) => `<article class="purple-entry"><strong>${escapeHtml(item.degree || "Degree")}</strong><p>${escapeHtml(item.college || "College")} • ${escapeHtml(item.year || "Year")}</p></article>`).join("")}
					</section>
					<section class="purple-section"><h3>Skills</h3><ul class="purple-skills">${skillMeter}</ul></section>
				</div>
			</section>
		`;
		return;
	}

	if (state.template === "teal-interior-pro") {
		const competencyRows = fallbackSkills.slice(0, 5).map((item, idx) => `<li><span>${escapeHtml(item)}</span><span class="tealpro-meter">${10 - (idx % 2)}</span></li>`).join("");

		el.resumeDoc.innerHTML = `
			<section class="tealpro-shell">
				<aside class="tealpro-left">
					${state.personal.imageDataUrl ? `<img class="tealpro-avatar" src="${state.personal.imageDataUrl}" alt="Profile" />` : `<div class="tealpro-avatar tealpro-avatar-fallback">${escapeHtml((state.personal.name || "R").slice(0, 1).toUpperCase())}</div>`}
					<section><h4>Summary</h4><p>${escapeHtml(state.about || "Professional summary goes here.")}</p></section>
					<section><h4>Core Competencies</h4><ul class="tealpro-competencies">${competencyRows}</ul></section>
				</aside>
				<div class="tealpro-main">
					<header class="tealpro-head">
						<h2>${escapeHtml(state.personal.name || "Your Name")}</h2>
						<p>${escapeHtml(state.personal.profession || "Interior Designer")}</p>
						<div>${escapeHtml(state.personal.phone || "Phone")} • ${escapeHtml(state.personal.address || "Address")} • ${escapeHtml(state.personal.email || "Email")}</div>
					</header>
					<section class="tealpro-section"><h3>Work Experience</h3>
					${experienceItems.map((item) => `<article class="tealpro-entry"><p class="tealpro-sub">${escapeHtml(item.duration || "Duration")}</p><strong>${escapeHtml(item.role || "Role")}</strong><p>${escapeHtml(item.company || "Company")}</p><ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></article>`).join("")}
					</section>
					<section class="tealpro-section"><h3>Education</h3>
					${educationItems.map((item) => `<article class="tealpro-entry"><p class="tealpro-sub">${escapeHtml(item.year || "Year")}</p><strong>${escapeHtml(item.degree || "Degree")}</strong><p>${escapeHtml(item.college || "College")}</p></article>`).join("")}
					</section>
					<section class="tealpro-section tealpro-portfolio"><h3>Portfolio</h3><div class="tealpro-portfolio-grid">${portfolioCards.map((item) => `<div><strong>${escapeHtml(item.title || "Project")}</strong>${item.description ? `<span>${escapeHtml(item.description)}</span>` : ""}</div>`).join("")}</div></section>
				</div>
			</section>
		`;
		return;
	}

	if (state.template === "green-impact-pro") {
		const skillRows = fallbackSkills.slice(0, 5).map((item) => `<li><span>${escapeHtml(item)}</span><span class="greenpro-meter" aria-hidden="true"></span></li>`).join("");

		el.resumeDoc.innerHTML = `
			<section class="greenpro-shell">
				<div class="greenpro-main">
					<header class="greenpro-head">
						<h2>${escapeHtml(state.personal.name || "Your Name")}</h2>
						<p>${escapeHtml(state.personal.profession || "Professional")}</p>
						<div>${escapeHtml(state.personal.email || "email@example.com")} • ${escapeHtml(state.personal.phone || "Phone")} • ${escapeHtml(state.personal.address || "Address")}</div>
					</header>
					<section class="greenpro-section"><h3>Professional Summary</h3><p>${escapeHtml(state.about || "Add your summary")}</p></section>
					<section class="greenpro-section"><h3>Work Experience</h3>
					${experienceItems.map((item) => `<article class="greenpro-entry"><strong>${escapeHtml(item.role || "Role")}</strong><p>${escapeHtml(item.company || "Company")} • ${escapeHtml(item.duration || "Duration")}</p><ul>${toBullets(item.description).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></article>`).join("")}
					</section>
					<section class="greenpro-section"><h3>Education</h3>
					${educationItems.map((item) => `<article class="greenpro-entry"><strong>${escapeHtml(item.degree || "Degree")}</strong><p>${escapeHtml(item.college || "College")} • ${escapeHtml(item.year || "Year")}</p></article>`).join("")}
					</section>
				</div>
				<aside class="greenpro-right">
					${state.personal.imageDataUrl ? `<img class="greenpro-avatar" src="${state.personal.imageDataUrl}" alt="Profile" />` : `<div class="greenpro-avatar greenpro-avatar-fallback">${escapeHtml((state.personal.name || "A").slice(0, 1).toUpperCase())}</div>`}
					<section><h4>Skills</h4><ul class="greenpro-skills">${skillRows}</ul></section>
					<section><h4>Interests</h4><p>${interestsList.map((item) => escapeHtml(item)).join(" • ")}</p></section>
					<section><h4>Strengths</h4><div class="greenpro-strengths">${strengthsList.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
					<section><h4>Languages</h4><div class="greenpro-langs">${normalizedLanguages.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
					<section class="greenpro-achievements"><h4>Achievements</h4><ul>${achievementsList.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
				</aside>
			</section>
		`;
		return;
	}

	if (state.template === "professional-wave") {
		el.resumeDoc.innerHTML = `${waveHeader}${orderedSectionsHtml()}`;
		return;
	}

	if (state.template === "sidebar") {
		el.resumeDoc.innerHTML = `
			<aside class="left-rail">
				${header}
				${sectionHtml("skills")}
			</aside>
			<div>
				${state.sectionOrder
					.filter((s) => s !== "skills")
					.map((s) => sectionHtml(s))
					.join("")}
			</div>
		`;
		return;
	}

	el.resumeDoc.innerHTML = `${header}${orderedSectionsHtml()}`;
}

function applyBuilderUiStyle() {
	document.body.classList.remove("ui-glass", "ui-midnight", "ui-paper");
	document.body.classList.add(`ui-${state.uiStyle}`);
}

function setStep(step) {
	state.currentStep = Math.max(1, Math.min(5, step));
	el.stepTabs.forEach((tab) => {
		tab.classList.toggle("active", Number(tab.dataset.step) === state.currentStep);
	});
	el.stepPanels.forEach((panel) => {
		panel.classList.toggle("active", Number(panel.dataset.stepPanel) === state.currentStep);
	});
}

function bindStepControls() {
	el.stepTabs.forEach((tab) => {
		tab.addEventListener("click", () => setStep(Number(tab.dataset.step)));
	});
	el.prevStepBtn.addEventListener("click", () => setStep(state.currentStep - 1));
	el.nextStepBtn.addEventListener("click", () => setStep(state.currentStep + 1));
}

function renderEducationFields() {
	el.educationList.innerHTML = "";
	state.education.forEach((item, index) => {
		const card = document.createElement("div");
		card.className = "item-card";
		card.innerHTML = `
			<div class="item-head"><strong>Education ${index + 1}</strong><button type="button" class="item-remove">Remove</button></div>
			<div class="grid two">
				<label>College<input data-key="college" type="text" value="${escapeHtml(item.college)}" /></label>
				<label>Year<input data-key="year" type="text" value="${escapeHtml(item.year)}" /></label>
				<label>Degree<input data-key="degree" type="text" value="${escapeHtml(item.degree)}" /></label>
				<label class="span-2">Description<textarea data-key="description" rows="3">${escapeHtml(item.description)}</textarea></label>
			</div>
		`;

		card.querySelector(".item-remove").addEventListener("click", () => {
			state.education.splice(index, 1);
			renderEducationFields();
			renderPreview();
		});

		card.querySelectorAll("input, textarea").forEach((input) => {
			input.addEventListener("input", () => {
				state.education[index][input.dataset.key] = input.value;
				renderPreview();
			});
		});

		el.educationList.appendChild(card);
	});
}

function renderExperienceFields() {
	el.experienceList.innerHTML = "";
	state.experience.forEach((item, index) => {
		const card = document.createElement("div");
		card.className = "item-card";
		card.innerHTML = `
			<div class="item-head"><strong>Experience ${index + 1}</strong><button type="button" class="item-remove">Remove</button></div>
			<div class="grid two">
				<label>Company<input data-key="company" type="text" value="${escapeHtml(item.company)}" /></label>
				<label>Role<input data-key="role" type="text" value="${escapeHtml(item.role)}" /></label>
				<label>Duration<input data-key="duration" type="text" value="${escapeHtml(item.duration)}" /></label>
				<label class="span-2">Description<textarea data-key="description" rows="3">${escapeHtml(item.description)}</textarea></label>
			</div>
		`;

		card.querySelector(".item-remove").addEventListener("click", () => {
			state.experience.splice(index, 1);
			renderExperienceFields();
			renderPreview();
		});

		card.querySelectorAll("input, textarea").forEach((input) => {
			input.addEventListener("input", () => {
				state.experience[index][input.dataset.key] = input.value;
				renderPreview();
			});
		});

		el.experienceList.appendChild(card);
	});
}

function renderSkills() {
	if (!el.skillTags) return;
	el.skillTags.innerHTML = "";
	state.skills.forEach((skill, index) => {
		const tag = document.createElement("span");
		tag.className = "tag";
		tag.innerHTML = `${escapeHtml(skill)} <button type="button">x</button>`;
		tag.querySelector("button").addEventListener("click", () => {
			state.skills.splice(index, 1);
			renderSkills();
			renderPreview();
		});
		el.skillTags.appendChild(tag);
	});
}

function renderLanguages() {
	if (!el.languageTags) return;
	el.languageTags.innerHTML = "";
	state.languages.forEach((language, index) => {
		const tag = document.createElement("span");
		tag.className = "tag";
		tag.innerHTML = `${escapeHtml(language)} <button type="button">x</button>`;
		tag.querySelector("button").addEventListener("click", () => {
			state.languages.splice(index, 1);
			renderLanguages();
			renderPreview();
		});
		el.languageTags.appendChild(tag);
	});
}

function renderInterests() {
	if (!el.interestTags) return;
	el.interestTags.innerHTML = "";
	state.interests.forEach((interest, index) => {
		const tag = document.createElement("span");
		tag.className = "tag";
		tag.innerHTML = `${escapeHtml(interest)} <button type="button">x</button>`;
		tag.querySelector("button").addEventListener("click", () => {
			state.interests.splice(index, 1);
			renderInterests();
			renderPreview();
		});
		el.interestTags.appendChild(tag);
	});
}

function renderStrengths() {
	if (!el.strengthTags) return;
	el.strengthTags.innerHTML = "";
	state.strengths.forEach((strength, index) => {
		const tag = document.createElement("span");
		tag.className = "tag";
		tag.innerHTML = `${escapeHtml(strength)} <button type="button">x</button>`;
		tag.querySelector("button").addEventListener("click", () => {
			state.strengths.splice(index, 1);
			renderStrengths();
			renderPreview();
		});
		el.strengthTags.appendChild(tag);
	});
}

function renderAchievements() {
	if (!el.achievementTags) return;
	el.achievementTags.innerHTML = "";
	state.achievements.forEach((achievement, index) => {
		const tag = document.createElement("span");
		tag.className = "tag";
		tag.innerHTML = `${escapeHtml(achievement)} <button type="button">x</button>`;
		tag.querySelector("button").addEventListener("click", () => {
			state.achievements.splice(index, 1);
			renderAchievements();
			renderPreview();
		});
		el.achievementTags.appendChild(tag);
	});
}

function renderPortfolioFields() {
	if (!el.portfolioList) return;
	el.portfolioList.innerHTML = "";
	state.portfolioItems.forEach((item, index) => {
		const card = document.createElement("div");
		card.className = "item-card";
		card.innerHTML = `
			<div class="item-head"><strong>Portfolio ${index + 1}</strong><button type="button" class="item-remove">Remove</button></div>
			<div class="grid two">
				<label>Title<input data-key="title" type="text" value="${escapeHtml(item.title || "")}" /></label>
				<label class="span-2">Description<textarea data-key="description" rows="3">${escapeHtml(item.description || "")}</textarea></label>
			</div>
		`;

		card.querySelector(".item-remove").addEventListener("click", () => {
			state.portfolioItems.splice(index, 1);
			renderPortfolioFields();
			renderPreview();
		});

		card.querySelectorAll("input, textarea").forEach((input) => {
			input.addEventListener("input", () => {
				state.portfolioItems[index][input.dataset.key] = input.value;
				renderPreview();
			});
		});

		el.portfolioList.appendChild(card);
	});
}

function bindPersonalInputs() {
	personalFields.forEach((key) => {
		const input = document.getElementById(key);
		input.value = state.personal[key] || "";
		input.addEventListener("input", () => {
			state.personal[key] = input.value;
			renderPreview();
		});
	});

	const aboutInput = document.getElementById("about");
	aboutInput.value = state.about;
	aboutInput.addEventListener("input", () => {
		state.about = aboutInput.value;
		renderPreview();
	});

	el.profileImage.addEventListener("change", (e) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			state.personal.imageDataUrl = String(reader.result || "");
			renderPreview();
		};
		reader.readAsDataURL(file);
	});
}

function bindCollectionActions() {
	el.addEducationBtn.addEventListener("click", () => {
		state.education.push({ college: "", year: "", degree: "", description: "" });
		renderEducationFields();
		renderPreview();
	});

	el.addExperienceBtn.addEventListener("click", () => {
		state.experience.push({ company: "", role: "", duration: "", description: "" });
		renderExperienceFields();
		renderPreview();
	});

	el.addSkillBtn.addEventListener("click", () => {
		const value = el.skillInput.value.trim();
		if (!value) return;
		state.skills.push(value);
		el.skillInput.value = "";
		renderSkills();
		renderPreview();
	});

	el.addLanguageBtn?.addEventListener("click", () => {
		const value = el.languageInput.value.trim();
		if (!value) return;
		state.languages.push(value);
		el.languageInput.value = "";
		renderLanguages();
		renderPreview();
	});

	el.addInterestBtn?.addEventListener("click", () => {
		const value = el.interestInput.value.trim();
		if (!value) return;
		state.interests.push(value);
		el.interestInput.value = "";
		renderInterests();
		renderPreview();
	});

	el.addStrengthBtn?.addEventListener("click", () => {
		const value = el.strengthInput.value.trim();
		if (!value) return;
		state.strengths.push(value);
		el.strengthInput.value = "";
		renderStrengths();
		renderPreview();
	});

	el.addAchievementBtn?.addEventListener("click", () => {
		const value = el.achievementInput.value.trim();
		if (!value) return;
		state.achievements.push(value);
		el.achievementInput.value = "";
		renderAchievements();
		renderPreview();
	});

	el.addPortfolioBtn?.addEventListener("click", () => {
		state.portfolioItems.push({ title: "", description: "" });
		renderPortfolioFields();
		renderPreview();
	});
}

function bindTemplateControls() {
	el.templateSelect.value = state.template;
	el.themeSelect.value = state.theme;
	el.fontSelect.value = state.fontFamily;
	el.backgroundSelect.value = state.backgroundDesign;
	el.uiStyleSelect.value = state.uiStyle;

	el.templateSelect.addEventListener("change", () => {
		state.template = el.templateSelect.value;
		ensureTemplateCustom(state.template);
		renderTemplateCustomSettings();
		renderPreview();
	});

	el.themeSelect.addEventListener("change", () => {
		state.theme = el.themeSelect.value;
		renderPreview();
	});

	el.fontSelect.addEventListener("change", () => {
		state.fontFamily = el.fontSelect.value;
		renderPreview();
	});

	el.backgroundSelect.addEventListener("change", () => {
		state.backgroundDesign = el.backgroundSelect.value;
		renderPreview();
	});

	el.uiStyleSelect.addEventListener("change", () => {
		state.uiStyle = el.uiStyleSelect.value;
		applyBuilderUiStyle();
	});
}

function bindSectionReorder() {
	Sortable.create(el.sectionOrderList, {
		animation: 180,
		onEnd: () => {
			const order = [...el.sectionOrderList.querySelectorAll("li")].map((li) => li.dataset.section);
			state.sectionOrder = order;
			renderPreview();
		},
	});
}

function payload() {
	return {
		template: state.template,
		theme: state.theme,
		fontFamily: state.fontFamily,
		templateCustom: state.templateCustom,
		backgroundDesign: state.backgroundDesign,
		colorPalette: state.colorPalette,
		uiStyle: state.uiStyle,
		sectionOrder: state.sectionOrder,
		personal: state.personal,
		about: state.about,
		education: state.education,
		experience: state.experience,
		skills: state.skills,
		languages: state.languages,
		achievements: state.achievements,
		interests: state.interests,
		strengths: state.strengths,
		portfolioItems: state.portfolioItems,
		atsScore: computeAtsScore(),
	};
}

async function saveResume() {
	try {
		const response = await fetch(`${apiBase()}/resume/save`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload()),
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.message || "Save failed");

		el.resumeIdInput.value = data.resumeId || "";
		showStatus(`Saved. Resume ID: ${data.resumeId}`);
	} catch (err) {
		showStatus(err.message || "Unable to save resume", true);
	}
}

function applyLoadedResume(resume) {
	state.template = resume.template || "professional-wave";
	state.theme = resume.theme || "light";
	state.fontFamily = resume.fontFamily || "Manrope";
	state.templateCustom = { ...state.templateCustom, ...(resume.templateCustom || {}) };
	state.backgroundDesign = resume.backgroundDesign || "clean-paper";
	state.colorPalette = resume.colorPalette || "classic-blue";
	state.uiStyle = resume.uiStyle || "glass";
	state.sectionOrder = Array.isArray(resume.sectionOrder) ? resume.sectionOrder : state.sectionOrder;
	state.personal = { ...state.personal, ...(resume.personal || {}) };
	state.about = resume.about || "";
	state.education = Array.isArray(resume.education) ? resume.education : [];
	state.experience = Array.isArray(resume.experience) ? resume.experience : [];
	state.skills = Array.isArray(resume.skills) ? resume.skills : [];
	state.languages = Array.isArray(resume.languages) ? resume.languages : [];
	state.achievements = Array.isArray(resume.achievements) ? resume.achievements : [];
	state.interests = Array.isArray(resume.interests) ? resume.interests : [];
	state.strengths = Array.isArray(resume.strengths) ? resume.strengths : [];
	state.portfolioItems = Array.isArray(resume.portfolioItems) ? resume.portfolioItems : [];

	personalFields.forEach((key) => {
		document.getElementById(key).value = state.personal[key] || "";
	});
	document.getElementById("about").value = state.about;
	el.templateSelect.value = state.template;
	el.themeSelect.value = state.theme;
	el.fontSelect.value = state.fontFamily;
	el.backgroundSelect.value = state.backgroundDesign;
	el.uiStyleSelect.value = state.uiStyle;
	renderTemplateCustomSettings();

	renderEducationFields();
	renderExperienceFields();
	renderSkills();
	renderLanguages();
	renderAchievements();
	renderInterests();
	renderStrengths();
	renderPortfolioFields();
	applyBuilderUiStyle();
	renderPreview();
}

async function loadResumeById() {
	const id = el.resumeIdInput.value.trim();
	if (!id) {
		showStatus("Enter resume ID first", true);
		return;
	}

	try {
		const response = await fetch(`${apiBase()}/resume/${id}`);
		const data = await response.json();
		if (!response.ok) throw new Error(data.message || "Load failed");
		applyLoadedResume(data.resume || {});
		showStatus("Resume loaded");
	} catch (err) {
		showStatus(err.message || "Unable to load resume", true);
	}
}

async function downloadPdf() {
	try {
		const filename = `${(state.personal.name || "resume").replace(/\s+/g, "_")}.pdf`;
		const html2canvasLib = window.html2canvas;
		const hasJspdf = Boolean(window.jspdf && window.jspdf.jsPDF);
		const hasHtml2Pdf = typeof window.html2pdf === "function";

		if (!hasHtml2Pdf && (typeof html2canvasLib !== "function" || !hasJspdf)) {
			throw new Error("PDF libraries are not loaded");
		}

		const exportWrapper = document.createElement("div");
		exportWrapper.setAttribute("data-export-wrapper", "resume");
		exportWrapper.style.position = "fixed";
		exportWrapper.style.left = "-100000px";
		exportWrapper.style.top = "0";
		exportWrapper.style.width = "794px";
		exportWrapper.style.padding = "0";
		exportWrapper.style.margin = "0";
		exportWrapper.style.background = "#ffffff";
		exportWrapper.style.zIndex = "-1";

		const exportNode = el.resumeDoc.cloneNode(true);
		exportNode.id = "resume-preview";
		exportNode.style.width = "794px";
		exportNode.style.minHeight = "1123px";
		exportNode.style.margin = "0";
		exportNode.style.borderRadius = "0";
		exportNode.style.boxShadow = "none";
		exportNode.style.overflow = "hidden";
		exportNode.style.background = "#ffffff";
		exportNode.style.padding = "20px";

		const ensureOnePageFit = () => {
			const targetHeight = 1123;
			let scale = 1;
			exportNode.style.fontSize = "14px";
			exportNode.style.lineHeight = "1.4";
			while (exportNode.scrollHeight > targetHeight && scale > 0.82) {
				scale -= 0.02;
				exportNode.style.fontSize = `${Math.round(14 * scale)}px`;
				exportNode.style.lineHeight = String(1.25 + 0.15 * scale);
			}
		};

		exportWrapper.appendChild(exportNode);
		document.body.appendChild(exportWrapper);
		ensureOnePageFit();

		if (hasHtml2Pdf) {
			try {
				await window
					.html2pdf()
					.set({
						filename,
						margin: [0, 0, 0, 0],
						image: { type: "jpeg", quality: 1 },
						html2canvas: {
							scale: 3,
							useCORS: true,
							backgroundColor: "#ffffff",
							windowWidth: 1400,
						},
						jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
						pagebreak: { mode: ["avoid-all"] },
					})
					.from(exportNode)
					.save();
				showStatus("Downloaded as single-page A4 PDF");
				return;
			} catch (html2pdfErr) {
				if (!(typeof html2canvasLib === "function" && hasJspdf)) {
					throw html2pdfErr;
				}
			}
		}

		if (!(typeof html2canvasLib === "function" && hasJspdf)) {
			throw new Error("PDF fallback libraries are not loaded");
		}

		const canvas = await html2canvasLib(exportNode, {
			scale: 3,
			useCORS: true,
			backgroundColor: "#ffffff",
			windowWidth: 1400,
		});

		const imageData = canvas.toDataURL("image/png", 1.0);
		const { jsPDF } = window.jspdf;
		const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

		const pageWidth = 210;
		const pageHeight = 297;
		const margin = 6;
		const targetWidth = pageWidth - margin * 2;
		const targetHeight = pageHeight - margin * 2;
		const scaleFactor = Math.min(targetWidth / canvas.width, targetHeight / canvas.height);
		const renderWidth = canvas.width * scaleFactor;
		const renderHeight = canvas.height * scaleFactor;
		const offsetX = (pageWidth - renderWidth) / 2;
		const offsetY = (pageHeight - renderHeight) / 2;

		pdf.addImage(imageData, "PNG", offsetX, offsetY, renderWidth, renderHeight, undefined, "FAST");
		pdf.save(filename);
		showStatus("Downloaded as single-page A4 PDF");
	} catch (err) {
		showStatus(err.message || "Unable to download PDF", true);
	} finally {
		const staleWrapper = document.querySelector("div[data-export-wrapper='resume']");
		if (staleWrapper && document.body.contains(staleWrapper)) {
			document.body.removeChild(staleWrapper);
		}
	}
}

function bindActions() {
	el.saveResumeBtn.addEventListener("click", saveResume);
	el.loadResumeBtn.addEventListener("click", loadResumeById);
	el.downloadPdfBtn.addEventListener("click", downloadPdf);
}

function applySelectedPresetFromStorage() {
	const raw = localStorage.getItem(PRESET_STORAGE_KEY);
	if (!raw) return;

	try {
		const preset = JSON.parse(raw);
		if (preset && preset.template) state.template = preset.template;
		if (preset && preset.theme) state.theme = preset.theme;
		if (preset && preset.fontFamily) state.fontFamily = preset.fontFamily;
		if (preset && preset.templateCustom) state.templateCustom = { ...state.templateCustom, ...preset.templateCustom };
		if (preset && preset.backgroundDesign) state.backgroundDesign = preset.backgroundDesign;
		if (preset && preset.colorPalette) state.colorPalette = preset.colorPalette;
		if (preset && preset.uiStyle) state.uiStyle = preset.uiStyle;
	} catch (error) {
		showStatus("Theme preset parse failed", true);
	} finally {
		localStorage.removeItem(PRESET_STORAGE_KEY);
	}

	showStatus("Selected theme applied. Continue editing your resume.");
}

function init() {
	applySelectedPresetFromStorage();
	ensureTemplateCustom(state.template);
	bindStepControls();
	bindPersonalInputs();
	bindCollectionActions();
	bindTemplateControls();
	bindSectionReorder();
	bindActions();
	renderTemplateCustomSettings();
	renderEducationFields();
	renderExperienceFields();
	renderSkills();
	renderLanguages();
	renderAchievements();
	renderInterests();
	renderStrengths();
	renderPortfolioFields();
	applyBuilderUiStyle();
	renderPreview();
}

init();
