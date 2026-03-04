const API_BASE = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGetMe() {
  const res = await fetch(`${API_BASE}/users/me`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load profile");
  return data.user;
}

async function apiUpdateMe(payload) {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save profile");
  return data.user;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!getToken()) {
    window.location.href = "../signup/singup.html";
    return;
  }

  const nameEl = document.getElementById("profileName");
  const roleEl = document.getElementById("profileRole");
  const avatarEl = document.getElementById("profileAvatar");

  const nameInput = document.getElementById("profileNameInput");
  const avatarInput = document.getElementById("profileAvatarInput");
  const bioInput = document.getElementById("profileBioInput");
  const deptInput = document.getElementById("profileDeptInput");
  const yearInput = document.getElementById("profileYearInput");
  const form = document.getElementById("profileForm");

  try {
    const user = await apiGetMe();

    nameEl.textContent = user.name;
    roleEl.textContent = user.role.toUpperCase();
    nameInput.value = user.name;

    if (user.profile) {
      avatarInput.value = user.profile.avatarUrl || "";
      bioInput.value = user.profile.bio || "";
      deptInput.value = user.profile.department || "";
      yearInput.value = user.profile.year || "";
      if (user.profile.avatarUrl) {
        avatarEl.style.backgroundImage = `url('${user.profile.avatarUrl}')`;
      } else {
        avatarEl.style.backgroundImage =
          "linear-gradient(135deg,#ec4899,#eab308)";
      }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const updated = await apiUpdateMe({
          name: nameInput.value,
          profile: {
            avatarUrl: avatarInput.value,
            bio: bioInput.value,
            department: deptInput.value,
            year: yearInput.value,
          },
        });
        localStorage.setItem("user", JSON.stringify(updated));
        alert("Profile updated.");
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  } catch (err) {
    console.error(err);
    alert(err.message || "Unable to load profile");
  }
});

