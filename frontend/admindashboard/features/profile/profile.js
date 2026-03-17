const SETTINGS_STORAGE_KEY = "cms.settings.v1";

const els = {
  avatar: document.getElementById("avatar"),
  fullName: document.getElementById("fullName"),
  roleText: document.getElementById("roleText"),
  roleText2: document.getElementById("roleText2"),
  emailText: document.getElementById("emailText"),
  bioText: document.getElementById("bioText")
};

function loadSettingsProfile() {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return {
      fullName: "User",
      email: "",
      role: "",
      bio: "",
      avatarDataUrl: ""
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      fullName: parsed?.profile?.fullName || "User",
      email: parsed?.profile?.email || "",
      role: parsed?.profile?.role || "",
      bio: parsed?.profile?.bio || "",
      avatarDataUrl: parsed?.profile?.avatarDataUrl || ""
    };
  } catch (_err) {
    return {
      fullName: "User",
      email: "",
      role: "",
      bio: "",
      avatarDataUrl: ""
    };
  }
}

function renderProfile() {
  const profile = loadSettingsProfile();

  els.fullName.textContent = profile.fullName || "User";
  els.roleText.textContent = profile.role || "Role not set";
  els.roleText2.textContent = profile.role || "Not set";
  els.emailText.textContent = profile.email || "Not available";
  els.bioText.textContent = profile.bio || "No bio added yet.";

  if (profile.avatarDataUrl) {
    els.avatar.innerHTML = `<img src="${profile.avatarDataUrl}" alt="Profile avatar" />`;
  } else {
    const first = String(profile.fullName || "U").trim().charAt(0).toUpperCase() || "U";
    els.avatar.textContent = first;
  }
}

renderProfile();
