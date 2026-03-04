const API_BASE = "http://localhost:5000/api";

function getTokenFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token") || "";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const passwordInput = document.getElementById("newPassword");
  const statusEl = document.getElementById("resetStatus");
  const token = getTokenFromQuery();

  if (!token) {
    statusEl.textContent = "Missing reset token.";
    form.querySelector("button").disabled = true;
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    const password = passwordInput.value.trim();
    if (!password) return;

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      statusEl.textContent = data.message || "Updated.";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error resetting password.";
    }
  });
});

