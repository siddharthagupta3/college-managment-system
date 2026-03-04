var API_BASE = window.API_BASE || "http://localhost:5000/api";

function getTokenFromQuery() {
  var params = new URLSearchParams(window.location.search);
  return params.get("token") || "";
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("resetForm");
  var passwordInput = document.getElementById("newPassword");
  var statusEl = document.getElementById("resetStatus");
  var token = getTokenFromQuery();

  if (!token) {
    statusEl.textContent = "Invalid or missing reset link. Request a new one from Forgot Password.";
    statusEl.style.color = "#dc2626";
    form.querySelector("button").disabled = true;
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.style.color = "";
    var password = passwordInput.value.trim();
    if (password.length < 6) {
      statusEl.textContent = "Password must be at least 6 characters.";
      statusEl.style.color = "#dc2626";
      return;
    }

    try {
      var res = await fetch(API_BASE + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      var data = await res.json();
      statusEl.textContent = res.ok ? (data.message || "Password updated. You can log in now.") : (data.message || "Failed.");
      statusEl.style.color = res.ok ? "#22c55e" : "#dc2626";
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Could not connect. Try again.";
      statusEl.style.color = "#dc2626";
    }
  });
});

