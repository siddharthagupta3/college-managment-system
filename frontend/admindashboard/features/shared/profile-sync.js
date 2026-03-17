(function () {
  const SETTINGS_STORAGE_KEY = "cms.settings.v1";

  function parseSettings() {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_err) {
      return null;
    }
  }

  function getProfileData() {
    const settings = parseSettings();
    const profile = settings && settings.profile ? settings.profile : {};

    const fullName = String(profile.fullName || profile.name || "User").trim() || "User";
    const email = String(profile.email || "").trim();
    const role = String(profile.role || "").trim();
    const avatarDataUrl = String(profile.avatarDataUrl || "").trim();

    return { fullName, email, role, avatarDataUrl };
  }

  function profileInitial(name) {
    return String(name || "U").trim().charAt(0).toUpperCase() || "U";
  }

  function renderBadge(target) {
    if (!target) return;

    const profile = getProfileData();
    const profileLink = target.getAttribute("data-profile-link") || "features/profile/profile.html";
    const avatarHtml = profile.avatarDataUrl
      ? `<img src="${profile.avatarDataUrl}" alt="User profile" class="cms-profile-avatar-image" />`
      : `<span class="cms-profile-avatar-fallback">${profileInitial(profile.fullName)}</span>`;

    target.innerHTML = `
      <a class="cms-profile-wrap cms-profile-badge" href="${profileLink}" aria-label="Open profile page">
        <span class="cms-profile-avatar">${avatarHtml}</span>
        <span class="cms-profile-meta">
          <strong>${profile.fullName}</strong>
          <small>${profile.role || profile.email || "Open profile"}</small>
        </span>
      </a>
    `;
  }

  function initProfileBadges() {
    document.querySelectorAll("[data-cms-profile-badge]").forEach(renderBadge);
  }

  window.CMSProfileSync = {
    getProfileData,
    renderBadge,
    initProfileBadges,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProfileBadges);
  } else {
    initProfileBadges();
  }
})();
