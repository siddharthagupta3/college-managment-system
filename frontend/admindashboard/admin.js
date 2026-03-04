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

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

let currentGroupId = null;
let socket = null;

function renderAdminHeader(user) {
  const nameEl = document.getElementById("adminName");
  const roleEl = document.getElementById("adminRole");
  const avatarEl = document.getElementById("adminAvatar");

  if (nameEl && user?.name) nameEl.textContent = user.name;
  if (roleEl && user?.role) roleEl.textContent = `${user.role.toUpperCase()} • CMS`;
  if (avatarEl) {
    const avatarUrl = user?.profile?.avatarUrl;
    if (avatarUrl) {
      avatarEl.style.backgroundImage = `url('${avatarUrl}')`;
    } else {
      avatarEl.style.backgroundImage =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  }
}

function renderGroups(groups) {
  const list = document.getElementById("groupsList");
  if (!list) return;
  list.innerHTML = "";
  if (!groups.length) {
    list.innerHTML = "<li class='empty'>No groups yet. Create one!</li>";
    return;
  }
  groups.forEach((g) => {
    const li = document.createElement("li");
    li.className = "group-item";
    li.dataset.id = g._id;
    li.innerHTML = `
      <div class="group-main">
        <h3>${g.name}</h3>
        <small>Members: ${g.members?.length ?? "?"}</small>
      </div>
    `;
    li.addEventListener("click", () => selectGroup(g._id, g.name));
    list.appendChild(li);
  });
}

function appendMessage(message) {
  const list = document.getElementById("messagesList");
  if (!list) return;
  const item = document.createElement("div");
  item.className = "message-item";
  const senderName = message.sender?.name || "Unknown";
  const when = new Date(message.createdAt || Date.now()).toLocaleTimeString();
  item.innerHTML = `
    <div class="message-meta">
      <span class="sender">${senderName}</span>
      <span class="time">${when}</span>
    </div>
    <div class="message-text">${message.text}</div>
  `;
  list.appendChild(item);
  list.scrollTop = list.scrollHeight;
}

function renderMessages(messages) {
  const list = document.getElementById("messagesList");
  if (!list) return;
  list.innerHTML = "";
  messages.forEach(appendMessage);
}

async function loadGroups() {
  try {
    const data = await apiGet("/groups");
    renderGroups(data.groups || []);
  } catch (err) {
    console.error(err);
    alert("Unable to load groups");
  }
}

async function selectGroup(groupId, groupName) {
  currentGroupId = groupId;
  const title = document.getElementById("chatGroupTitle");
  if (title) title.textContent = groupName || "Group";

  try {
    const data = await apiGet(`/messages/group/${groupId}`);
    renderMessages(data.messages || []);
  } catch (err) {
    console.error(err);
    alert("Unable to load messages");
  }

  if (socket) {
    socket.emit("join:group", { groupId });
  }
}

async function createGroupFlow() {
  const name = prompt("Enter group name:");
  if (!name) return;
  try {
    const data = await apiPost("/groups", { name });
    await loadGroups();
    if (data.group?._id) {
      await selectGroup(data.group._id, data.group.name);
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Unable to create group");
  }
}

async function sendMessage(text) {
  if (!currentGroupId) {
    alert("Select a group first.");
    return;
  }
  const payload = { text };
  const data = await apiPost(`/messages/group/${currentGroupId}`, payload);
  appendMessage(data.message);
}

async function reactToMessage(messageId, emoji) {
  const res = await fetch(`${API_BASE}/messages/${messageId}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ emoji }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "React failed");
  return data.message;
}

function setupSocket(user) {
  const token = getToken();
  if (!token || typeof io === "undefined") return;
  socket = io("http://localhost:5000", { auth: { token } });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("message:new", (message) => {
    if (message.group === currentGroupId || message.group?._id === currentGroupId) {
      appendMessage(message);
    }
  });

  socket.on("notification:new", (n) => {
    console.log("Notification", n);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = getUser();
  if (!user) {
    window.location.href = "../signup/singup.html";
    return;
  }

  renderAdminHeader(user);

  const roleBadge = document.getElementById("chatRoleBadge");
  if (roleBadge) roleBadge.textContent = user.role.toUpperCase();

  // Logout handler
  const logoutArea = document.querySelector(".header-menu .user");
  if (logoutArea) {
    logoutArea.style.cursor = "pointer";
    logoutArea.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "../signup/singup.html";
    });
  }

  const createBtn = document.getElementById("createGroupBtn");
  if (createBtn) {
    if (user.role === "admin" || user.role === "faculty") {
      createBtn.addEventListener("click", createGroupFlow);
    } else {
      createBtn.disabled = true;
      createBtn.classList.add("disabled");
    }
  }

  const form = document.getElementById("messageForm");
  const input = document.getElementById("messageInput");
  if (form && input) {
    if (user.role === "admin" || user.role === "faculty") {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        try {
          await sendMessage(text);
          input.value = "";
        } catch (err) {
          console.error(err);
          alert(err.message || "Unable to send message");
        }
      });
    } else {
      input.disabled = true;
      input.placeholder = "Only admins and faculty can send messages.";
    }
  }

  await loadGroups();
  setupSocket(user);
});

