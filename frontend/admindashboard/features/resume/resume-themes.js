const STORAGE_KEY = "resumeBuilderPresetSelectionV1";

const templates = [
	{ id: "professional-wave", name: "Professional Wave", category: "classic", baseColor: "Blue Orange", recommended: true, config: { template: "professional-wave", theme: "light", fontFamily: "Manrope", uiStyle: "paper" } },
	{ id: "executive-sidebar", name: "Executive Sidebar", category: "modern", baseColor: "Navy", config: { template: "executive-sidebar", theme: "light", fontFamily: "Manrope", uiStyle: "paper" } },
	{ id: "teal-split", name: "Teal Split", category: "creative", baseColor: "Teal", config: { template: "teal-split", theme: "light", fontFamily: "Montserrat", uiStyle: "glass" } },
	{ id: "student-mint", name: "Student Mint", category: "classic", baseColor: "Mint", config: { template: "student-mint", theme: "light", fontFamily: "Manrope", uiStyle: "paper" } },
	{ id: "editorial-rose", name: "Editorial Rose", category: "creative", baseColor: "Rose", config: { template: "editorial-rose", theme: "light", fontFamily: "Manrope", uiStyle: "paper" } },
	{ id: "mono-accountant", name: "Mono Accountant", category: "classic", baseColor: "Mono", config: { template: "mono-accountant", theme: "light", fontFamily: "Montserrat", uiStyle: "glass" } },
	{ id: "medical-column", name: "Medical Column", category: "modern", baseColor: "Coral", config: { template: "medical-column", theme: "light", fontFamily: "Manrope", uiStyle: "paper" } },
	{ id: "crimson-education", name: "Crimson Education", category: "modern", baseColor: "Crimson", config: { template: "crimson-education", theme: "light", fontFamily: "Montserrat", uiStyle: "paper" } },
	{ id: "brown-minimalist", name: "Brown Minimalist", category: "classic", baseColor: "Brown", config: { template: "brown-minimalist", theme: "light", fontFamily: "Manrope", uiStyle: "paper" } },
	{ id: "purple-creator", name: "Purple Creator", category: "creative", baseColor: "Purple", config: { template: "purple-creator", theme: "light", fontFamily: "Manrope", uiStyle: "glass" } },
	{ id: "teal-interior-pro", name: "Teal Interior Pro", category: "modern", baseColor: "Teal", config: { template: "teal-interior-pro", theme: "light", fontFamily: "Manrope", uiStyle: "paper" } },
	{ id: "green-impact-pro", name: "Green Impact Pro", category: "modern", baseColor: "Green", config: { template: "green-impact-pro", theme: "light", fontFamily: "Montserrat", uiStyle: "paper" } },
];

const colorVariantMeta = {
	blue: { label: "Blue", colorPalette: "classic-blue", backgroundDesign: "soft-grid" },
	green: { label: "Green", colorPalette: "emerald-fresh", backgroundDesign: "dot-matrix" },
	purple: { label: "Purple", colorPalette: "royal-purple", backgroundDesign: "mesh-wave" },
	dark: { label: "Dark", colorPalette: "midnight-neon", backgroundDesign: "neon-frame" },
	orange: { label: "Orange", colorPalette: "sunset-coral", backgroundDesign: "angled-lines" },
};

const state = {
	filter: "all",
	color: "blue",
	selectedTemplateId: "professional-wave",
};

const el = {
	themeGrid: document.getElementById("themeGrid"),
	colorVariantSelect: document.getElementById("colorVariantSelect"),
	filterTabs: [...document.querySelectorAll(".filter-tab")],
	mainPreviewImage: document.getElementById("mainPreviewImage"),
	previewMeta: document.getElementById("previewMeta"),
	selectTemplateBtn: document.getElementById("selectTemplateBtn"),
	fullscreenPreviewBtn: document.getElementById("fullscreenPreviewBtn"),
	fullscreenModal: document.getElementById("fullscreenModal"),
	fullscreenImage: document.getElementById("fullscreenImage"),
	closeFullscreenBtn: document.getElementById("closeFullscreenBtn"),
};

function imagePath(templateId, color) {
	return `public/templates/${templateId}-${color}.svg`;
}

function visibleTemplates() {
	if (state.filter === "all") return templates;
	return templates.filter((item) => item.category === state.filter);
}

function renderCards() {
	const items = visibleTemplates();
	el.themeGrid.innerHTML = "";

	items.forEach((item, index) => {
		const card = document.createElement("article");
		card.className = "theme-card";
		if (item.id === state.selectedTemplateId) card.classList.add("selected");
		card.style.animationDelay = `${index * 45}ms`;

		card.innerHTML = `
			<div class="card-image-wrap">
				${item.recommended ? '<span class="recommended-tag">Recommended</span>' : ""}
				<img class="theme-thumb" src="${imagePath(item.id, state.color)}" alt="${item.name} template preview" />
			</div>
			<div class="card-meta">
				<strong>${item.name}</strong>
				<span>${colorVariantMeta[state.color].label} Theme</span>
			</div>
			<button type="button" class="select-btn">Select Template</button>
		`;

		card.addEventListener("click", (event) => {
			if (event.target.closest(".select-btn")) return;
			state.selectedTemplateId = item.id;
			renderCards();
			renderMainPreview();
		});

		card.querySelector(".select-btn").addEventListener("click", () => {
			state.selectedTemplateId = item.id;
			saveAndRedirect();
		});

		el.themeGrid.appendChild(card);
	});
}

function renderMainPreview() {
	const selected = templates.find((item) => item.id === state.selectedTemplateId) || templates[0];
	const colorName = colorVariantMeta[state.color].label;
	const src = imagePath(selected.id, state.color);

	el.mainPreviewImage.src = src;
	el.mainPreviewImage.alt = `${selected.name} full preview`;
	el.previewMeta.textContent = `${selected.name} • ${colorName} Theme`;
	el.fullscreenImage.src = src;
	el.fullscreenImage.alt = `${selected.name} full screen preview`;
}

function selectedPayload() {
	const selected = templates.find((item) => item.id === state.selectedTemplateId) || templates[0];
	const colorMeta = colorVariantMeta[state.color];
	const forcedTheme = state.color === "dark" ? "dark" : selected.config.theme;

	return {
		presetId: selected.id,
		template: selected.config.template,
		theme: forcedTheme,
		fontFamily: selected.config.fontFamily,
		backgroundDesign: colorMeta.backgroundDesign,
		colorPalette: colorMeta.colorPalette,
		uiStyle: state.color === "dark" ? "midnight" : selected.config.uiStyle,
	};
}

function saveAndRedirect() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPayload()));
	window.location.href = "resume.html";
}

function bindFilters() {
	el.filterTabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			state.filter = tab.dataset.filter;
			el.filterTabs.forEach((item) => item.classList.toggle("active", item === tab));

			const visible = visibleTemplates();
			if (!visible.some((item) => item.id === state.selectedTemplateId)) {
				state.selectedTemplateId = visible[0]?.id || templates[0].id;
			}

			renderCards();
			renderMainPreview();
		});
	});
}

function bindColorSwitcher() {
	el.colorVariantSelect.addEventListener("change", () => {
		state.color = el.colorVariantSelect.value;
		renderCards();
		renderMainPreview();
	});
}

function bindPreviewActions() {
	el.selectTemplateBtn.addEventListener("click", saveAndRedirect);
	el.fullscreenPreviewBtn.addEventListener("click", () => {
		el.fullscreenModal.classList.add("show");
		el.fullscreenModal.setAttribute("aria-hidden", "false");
	});
	el.closeFullscreenBtn.addEventListener("click", () => {
		el.fullscreenModal.classList.remove("show");
		el.fullscreenModal.setAttribute("aria-hidden", "true");
	});
	el.fullscreenModal.addEventListener("click", (event) => {
		if (event.target === el.fullscreenModal) {
			el.fullscreenModal.classList.remove("show");
			el.fullscreenModal.setAttribute("aria-hidden", "true");
		}
	});
}

function init() {
	el.colorVariantSelect.value = state.color;
	bindFilters();
	bindColorSwitcher();
	bindPreviewActions();
	renderCards();
	renderMainPreview();
}

init();
