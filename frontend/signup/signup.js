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

function redirectAfterLogin(user) {
  if (!user || !user.role) {
    window.location.href = "../index.html";
    return;
  }
  if (user.role === "admin") {
    window.location.href = "../admindashboard/admin.html";
  } else {
    // For now, send faculty/students to landing page (you can add dashboards later)
    window.location.href = "../index.html";
  }
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
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const role = document.getElementById("signupRole").value;

  if (!name || !email || !password || !role) return;

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }
    saveAuth(data);
    redirectAfterLogin(data.user);
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