var API_BASE = window.API_BASE || "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("forgotForm");
  var emailInput = document.getElementById("forgotEmail");
  var statusEl = document.getElementById("forgotStatus");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.style.color = "";
    var email = emailInput.value.trim();
    if (!email) return;

    try {
      var res = await fetch(API_BASE + "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      var data = await res.json();
      statusEl.textContent = data.message || "If this email exists, a reset link has been sent.";
      statusEl.style.color = "#22c55e";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Could not connect. Check your connection or try again.";
      statusEl.style.color = "#dc2626";
    }
  });
});

