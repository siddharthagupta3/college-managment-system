const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

const API_BASE = "http://localhost:5000/api";

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
    const res = await fetch(`${API_BASE}/auth/login`, {
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
  const name = document.getElementById("signupName").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!name || !username || !email || !phone || !password) return;

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, phone, password }),
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

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, go directly to dashboard / home
  const existingUser = getUser();
  if (existingUser && existingUser.role === "admin") {
    redirectAfterLogin(existingUser);
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (signupForm) signupForm.addEventListener("submit", handleSignup);
});