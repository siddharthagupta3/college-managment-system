const SETTINGS_STORAGE_KEY = "cms.settings.v1";

// Keep this disabled for now. When you say "connect all to backend", just set enabled=true and baseUrl.
const SETTINGS_DATA_PROVIDER = {
  enabled: false,
  baseUrl: "",
  endpoints: {
    profile: "/api/settings/profile",
    preferences: "/api/settings/preferences",
    security: "/api/settings/security"
  }
};

const defaultSettings = {
  profile: {
    fullName: "Siddhartha Gupta",
    email: "student@college.edu",
    role: "Student",
    bio: "Focused on learning, collaboration, and smart productivity.",
    avatarDataUrl: ""
  },
  preferences: {
    emailNotifications: true,
    desktopReminders: false,
    weeklySummary: true
  }
};

const els = {
  modePill: document.getElementById("modePill"),
  statusText: document.getElementById("statusText"),
  saveAllBtn: document.getElementById("saveAllBtn"),
  securityBtn: document.getElementById("securityBtn"),
  avatarInput: document.getElementById("avatarInput"),
  avatarPreview: document.getElementById("avatarPreview"),
  fullName: document.getElementById("fullName"),
  email: document.getElementById("email"),
  role: document.getElementById("role"),
  bio: document.getElementById("bio"),
  prefEmail: document.getElementById("prefEmail"),
  prefReminders: document.getElementById("prefReminders"),
  prefWeekly: document.getElementById("prefWeekly")
};

let workingData = structuredClone(defaultSettings);

function providerLabel() {
  return SETTINGS_DATA_PROVIDER.enabled ? "Backend Mode" : "Local Mode";
}

function setStatus(message, isError) {
  els.statusText.textContent = message || "";
  els.statusText.style.color = isError ? "#b42318" : "#167a45";
}

function refreshProfileBadges() {
  if (window.CMSProfileSync && typeof window.CMSProfileSync.initProfileBadges === "function") {
    window.CMSProfileSync.initProfileBadges();
  }
}

function setAvatar(avatarDataUrl, fullName) {
  const name = String(fullName || "U").trim();
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  if (avatarDataUrl) {
    els.avatarPreview.innerHTML = `<img src="${avatarDataUrl}" alt="Profile avatar" />`;
    return;
  }

  els.avatarPreview.textContent = initial;
}

function writeForm(data) {
  els.fullName.value = data.profile.fullName || "";
  els.email.value = data.profile.email || "";
  els.role.value = data.profile.role || "";
  els.bio.value = data.profile.bio || "";
  els.prefEmail.checked = !!data.preferences.emailNotifications;
  els.prefReminders.checked = !!data.preferences.desktopReminders;
  els.prefWeekly.checked = !!data.preferences.weeklySummary;
  setAvatar(data.profile.avatarDataUrl, data.profile.fullName);
}

function readForm() {
  return {
    profile: {
      fullName: els.fullName.value.trim(),
      email: els.email.value.trim(),
      role: els.role.value.trim(),
      bio: els.bio.value.trim(),
      avatarDataUrl: workingData.profile.avatarDataUrl || ""
    },
    preferences: {
      emailNotifications: els.prefEmail.checked,
      desktopReminders: els.prefReminders.checked,
      weeklySummary: els.prefWeekly.checked
    }
  };
}

function saveLocal(data) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
}

function loadLocal() {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return structuredClone(defaultSettings);

  try {
    const parsed = JSON.parse(raw);
    return {
      profile: {
        ...defaultSettings.profile,
        ...(parsed.profile || {})
      },
      preferences: {
        ...defaultSettings.preferences,
        ...(parsed.preferences || {})
      }
    };
  } catch (_err) {
    return structuredClone(defaultSettings);
  }
}

async function providerRequest(endpointKey, method, payload) {
  if (!SETTINGS_DATA_PROVIDER.enabled) {
    throw new Error("Backend mode is disabled");
  }

  const endpoint = SETTINGS_DATA_PROVIDER.endpoints[endpointKey];
  const base = SETTINGS_DATA_PROVIDER.baseUrl.replace(/\/$/, "");
  const url = `${base}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: payload ? JSON.stringify(payload) : undefined
  });

  if (!response.ok) {
    throw new Error("Settings API request failed");
  }

  return response.json();
}

async function loadSettings() {
  if (!SETTINGS_DATA_PROVIDER.enabled) {
    return loadLocal();
  }

  const data = await providerRequest("profile", "GET");
  return {
    profile: {
      ...defaultSettings.profile,
      ...(data.profile || {})
    },
    preferences: {
      ...defaultSettings.preferences,
      ...(data.preferences || {})
    }
  };
}

async function saveSettings(data) {
  if (!SETTINGS_DATA_PROVIDER.enabled) {
    saveLocal(data);
    refreshProfileBadges();
    return;
  }

  await providerRequest("profile", "PUT", data);
}

function bindEvents() {
  els.saveAllBtn.addEventListener("click", async () => {
    try {
      const nextData = readForm();
      await saveSettings(nextData);
      workingData = nextData;
      setAvatar(workingData.profile.avatarDataUrl, workingData.profile.fullName);
      refreshProfileBadges();
      setStatus("Settings saved successfully.", false);
    } catch (err) {
      setStatus(err.message || "Unable to save settings.", true);
    }
  });

  els.fullName.addEventListener("input", () => {
    setAvatar(workingData.profile.avatarDataUrl, els.fullName.value);
  });

  els.securityBtn.addEventListener("click", () => {
    setStatus("Security workflows are ready and can be connected to backend later.", false);
  });

  els.avatarInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      workingData.profile.avatarDataUrl = result;
      setAvatar(result, els.fullName.value);
      refreshProfileBadges();
      setStatus("Avatar selected. Click Save Changes to persist.", false);
    };
    reader.readAsDataURL(file);
  });
}

async function init() {
  els.modePill.textContent = providerLabel();

  try {
    workingData = await loadSettings();
    writeForm(workingData);
    refreshProfileBadges();
    setStatus("Settings loaded.", false);
  } catch (err) {
    workingData = structuredClone(defaultSettings);
    writeForm(workingData);
    refreshProfileBadges();
    setStatus(err.message || "Could not load settings. Showing defaults.", true);
  }

  bindEvents();
}

init();