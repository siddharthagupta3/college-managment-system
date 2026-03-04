const API_BASE = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotForm");
  const emailInput = document.getElementById("forgotEmail");
  const statusEl = document.getElementById("forgotStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    const email = emailInput.value.trim();
    if (!email) return;

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      statusEl.textContent =
        data.message || "If this email exists, a reset link has been sent.";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Error sending reset link.";
    }
  });
});

