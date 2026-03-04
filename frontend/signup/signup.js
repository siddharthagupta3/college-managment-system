const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

var API_BASE = window.API_BASE || "http://localhost:5000/api";

function saveAuth(data) {
  if (!data || !data.token || !data.user) return;
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function redirectAfterLogin(user) {
  if (!user || !user.role) {
    window.location.href = "../index.html";
    return;
  }
  // For now, all roles share the same dashboard;
  // backend still enforces role-based permissions.
  window.location.href = "../admindashboard/admin.html";
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) return;

  try {
    var res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }
    saveAuth(data);
    redirectAfterLogin(data.user);
  } catch (err) {
    console.error(err);
    alert("Unable to login. Please try again.");
  }
}

async function handleSignup(e) {
  e.preventDefault();
  var name = document.getElementById("signupName").value.trim();
  var email = document.getElementById("signupEmail").value.trim();
  var phone = document.getElementById("signupPhone").value.trim();
  var password = document.getElementById("signupPassword").value.trim();

  if (!name || !email || !phone || !password) return;
  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    var res = await fetch(API_BASE + "/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }
    alert(data.message || "Verification email sent. Please check your Gmail inbox.");
  } catch (err) {
    console.error(err);
    alert("Unable to register. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var existingUser = getUser();
  if (existingUser && existingUser.id) {
    redirectAfterLogin(existingUser);
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (signupForm) signupForm.addEventListener("submit", handleSignup);
});