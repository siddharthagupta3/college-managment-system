const chatArea = document.getElementById("chatArea");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const attachBtn = document.getElementById("attachBtn");
const micBtn = document.getElementById("micBtn");
const deleteChatBtn = document.getElementById("deleteChatBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatList = document.getElementById("chatList");
const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const sidebarToggle = document.getElementById("sidebarToggle");
const quickButtons = document.querySelectorAll(".chip");
const greetingPrefix = document.getElementById("greetingPrefix");
const greetingDynamic = document.getElementById("greetingDynamic");
const profileImage = document.getElementById("profileImage");
const profileFallback = document.getElementById("profileFallback");

const GEMINI_LOCAL_CHAT_KEY = "geminiLocalChatStoreV2";
const DEFAULT_WELCOME = { role: "bot", text: "Welcome! Ask anything to Gemini." };
const DYNAMIC_WORDS = ["Explore", "Create", "Learn"];
let chatStore = { activeChatId: "", chats: [] };
let dynamicWordTimer = null;
let dynamicWordIndex = 0;

function messageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMessage(msg) {
  return {
    id: msg && msg.id ? msg.id : messageId(),
    role: msg && msg.role ? msg.role : "bot",
    text: msg && typeof msg.text === "string" ? msg.text : "",
  };
}

function addMessage(text, role) {
  const node = document.createElement("div");
  node.className = `msg ${role}`;
  node.textContent = text;
  chatArea.appendChild(node);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function renderMessages(messages) {
  chatArea.innerHTML = "";
  messages.forEach((msg) => {
    const safeMsg = normalizeMessage(msg);
    const role = safeMsg.role === "user" ? "user" : "bot";

    const node = document.createElement("div");
    node.className = `msg ${role}`;
    node.dataset.messageId = safeMsg.id;

    const textNode = document.createElement("span");
    textNode.className = "msg-text";
    textNode.textContent = safeMsg.text;
    node.appendChild(textNode);

    if (role === "user") {
      const actions = document.createElement("div");
      actions.className = "msg-actions";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "msg-action-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => editMessageById(safeMsg.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "msg-action-btn danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteMessageById(safeMsg.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      node.appendChild(actions);
    }

    chatArea.appendChild(node);
  });

  chatArea.scrollTop = chatArea.scrollHeight;
}

function editMessageById(targetId) {
  const activeChat = getActiveChat();
  if (!activeChat || !Array.isArray(activeChat.messages)) return;

  const index = activeChat.messages.findIndex((m) => normalizeMessage(m).id === targetId);
  if (index < 0) return;

  const current = normalizeMessage(activeChat.messages[index]);
  const updated = window.prompt("Edit your message:", current.text);
  if (updated === null) return;

  const nextText = updated.trim();
  if (!nextText) return;

  activeChat.messages[index] = { ...current, text: nextText };
  activeChat.updatedAt = Date.now();
  activeChat.title = makeChatTitle(activeChat.messages);
  saveStore();
  renderChatList();
  loadLocalMessages();
  showFlashNote("Message updated.");
}

function deleteMessageById(targetId) {
  const activeChat = getActiveChat();
  if (!activeChat || !Array.isArray(activeChat.messages)) return;

  const nextMessages = activeChat.messages.filter((m) => normalizeMessage(m).id !== targetId);
  activeChat.messages = nextMessages.length ? nextMessages : [{ ...DEFAULT_WELCOME, id: messageId() }];
  activeChat.updatedAt = Date.now();
  activeChat.title = makeChatTitle(activeChat.messages);
  saveStore();
  renderChatList();
  loadLocalMessages();
  showFlashNote("Message deleted.");
}

function makeChatTitle(messages) {
  const firstUser = (messages || []).find((m) => m.role === "user" && m.text);
  if (!firstUser) return "New Chat";
  return String(firstUser.text).trim().slice(0, 28) || "New Chat";
}

function saveStore() {
  localStorage.setItem(GEMINI_LOCAL_CHAT_KEY, JSON.stringify(chatStore));
}

function getActiveChat() {
  return chatStore.chats.find((c) => c.id === chatStore.activeChatId) || null;
}

function renderChatList() {
  chatList.innerHTML = "";
  const sorted = [...chatStore.chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  sorted.forEach((chat) => {
    const li = document.createElement("li");
    li.className = "chat-list-item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `chat-list-btn${chat.id === chatStore.activeChatId ? " active" : ""}`;
    btn.textContent = chat.title || "New Chat";
    btn.addEventListener("click", () => {
      chatStore.activeChatId = chat.id;
      saveStore();
      loadLocalMessages();
      renderChatList();
      closeSidebar();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "chat-delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete this chat");
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteChatThread(chat.id);
    });

    li.appendChild(btn);
    li.appendChild(deleteBtn);
    chatList.appendChild(li);
  });
}

function deleteChatThread(chatId) {
  const nextChats = chatStore.chats.filter((c) => c.id !== chatId);

  if (nextChats.length === 0) {
    chatStore = { activeChatId: "", chats: [] };
    saveStore();
    createNewChat();
    showFlashNote("Chat deleted.");
    return;
  }

  chatStore.chats = nextChats;
  if (chatStore.activeChatId === chatId) {
    chatStore.activeChatId = nextChats[0].id;
  }

  saveStore();
  loadLocalMessages();
  renderChatList();
  showFlashNote("Chat deleted.");
}

function openSidebar() {
  sidebar.classList.add("open");
  if (sidebarBackdrop) sidebarBackdrop.classList.add("open");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  if (sidebarBackdrop) sidebarBackdrop.classList.remove("open");
}

function createNewChat() {
  const id = `chat_${Date.now()}`;
  const chat = {
    id,
    title: "New Chat",
    updatedAt: Date.now(),
    messages: [{ ...DEFAULT_WELCOME, id: messageId() }],
  };
  chatStore.chats.push(chat);
  chatStore.activeChatId = id;
  saveStore();
  loadLocalMessages();
  renderChatList();
  showFlashNote("New chat started.");
}

function setProfile(username, profilePic) {
  const safeName = String(username || "Siddhartha");
  greetingPrefix.textContent = `Hi ${safeName},`;

  const firstChar = safeName.charAt(0).toUpperCase() || "U";
  profileFallback.textContent = firstChar;

  if (profilePic) {
    profileImage.src = profilePic;
    profileImage.classList.remove("hidden");
    profileFallback.classList.add("hidden");
  } else {
    profileImage.classList.add("hidden");
    profileFallback.classList.remove("hidden");
  }
}

function startGreetingWordLoop() {
  if (!greetingDynamic) return;
  if (dynamicWordTimer) return;

  greetingDynamic.textContent = DYNAMIC_WORDS[dynamicWordIndex];
  greetingDynamic.classList.add("is-returning");

  dynamicWordTimer = setInterval(() => {
    greetingDynamic.classList.remove("is-returning");
    greetingDynamic.classList.add("is-cutting");

    setTimeout(() => {
      dynamicWordIndex = (dynamicWordIndex + 1) % DYNAMIC_WORDS.length;
      greetingDynamic.textContent = DYNAMIC_WORDS[dynamicWordIndex];
      greetingDynamic.classList.remove("is-cutting");
      greetingDynamic.classList.add("is-returning");
    }, 360);
  }, 2400);
}

function loadProfileFromLocal() {
  if (window.CMSProfileSync && typeof window.CMSProfileSync.getProfileData === "function") {
    const profile = window.CMSProfileSync.getProfileData();
    setProfile(profile.fullName || "Siddhartha", profile.avatarDataUrl || "");
    return;
  }

  const raw = localStorage.getItem("user") || sessionStorage.getItem("user") || "";
  let parsed = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (_err) {
    parsed = {};
  }

  setProfile(parsed.username || parsed.name || "Siddhartha", parsed.profileImage || "");
}

function loadLocalMessages() {
  const activeChat = getActiveChat();
  if (!activeChat) return;

  let messages = Array.isArray(activeChat.messages) ? activeChat.messages.map(normalizeMessage) : [];
  if (!Array.isArray(messages) || messages.length === 0) {
    messages = [{ ...DEFAULT_WELCOME, id: messageId() }];
    activeChat.messages = messages;
    activeChat.updatedAt = Date.now();
    saveStore();
  } else {
    activeChat.messages = messages;
  }

  renderMessages(messages);
}

function showFlashNote(text) {
  const note = document.createElement("div");
  note.className = "flash-note";
  note.textContent = text;
  chatArea.appendChild(note);
  chatArea.scrollTop = chatArea.scrollHeight;
  setTimeout(() => note.remove(), 1650);
}

function clearChatWithAnimation() {
  const activeChat = getActiveChat();
  if (!activeChat) return;

  const messageNodes = Array.from(chatArea.querySelectorAll(".msg"));
  if (messageNodes.length === 0) {
    activeChat.messages = [{ ...DEFAULT_WELCOME, id: messageId() }];
    activeChat.updatedAt = Date.now();
    activeChat.title = "New Chat";
    saveStore();
    loadLocalMessages();
    renderChatList();
    showFlashNote("Chat already empty.");
    return;
  }

  messageNodes.forEach((node, index) => {
    setTimeout(() => node.classList.add("deleting"), index * 36);
  });

  const totalTime = messageNodes.length * 36 + 280;
  setTimeout(() => {
    activeChat.messages = [{ ...DEFAULT_WELCOME, id: messageId() }];
    activeChat.updatedAt = Date.now();
    activeChat.title = "New Chat";
    saveStore();
    loadLocalMessages();
    renderChatList();
    showFlashNote("Chat deleted.");
  }, totalTime);
}

function persistMessage(role, text) {
  const activeChat = getActiveChat();
  if (!activeChat) return;

  activeChat.messages.push({ id: messageId(), role, text });
  activeChat.updatedAt = Date.now();
  activeChat.title = makeChatTitle(activeChat.messages);
  saveStore();
  renderChatList();
}

function buildLocalReply(prompt) {
  const query = String(prompt || "").toLowerCase();

  if (query.includes("create image")) {
    return "Great idea. Describe the scene, style, and mood you want, and I will draft a prompt for image generation.";
  }
  if (query.includes("create music")) {
    return "Sure. Tell me genre, tempo, mood, and instruments, and I will generate a structured music concept.";
  }
  if (query.includes("cricket")) {
    return "Cricket mode on. Ask about rules, recent tournaments, batting strategy, or fantasy team tips.";
  }
  if (query.includes("help me learn") || query.includes("learn")) {
    return "I can help you learn step-by-step. Share your topic and current level, and I will build a simple learning path.";
  }

  return "I am running in local mode right now (backend disabled for this page). I can still help with ideas, drafts, and study guidance.";
}

function initStore() {
  const raw = localStorage.getItem(GEMINI_LOCAL_CHAT_KEY) || "";
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed.chats) && parsed.chats.length > 0) {
      chatStore = {
        activeChatId: parsed.activeChatId || parsed.chats[0].id,
        chats: parsed.chats,
      };
    } else {
      chatStore = { activeChatId: "", chats: [] };
    }
  } catch (_err) {
    chatStore = { activeChatId: "", chats: [] };
  }

  if (!chatStore.chats.length) {
    createNewChat();
    return;
  }

  if (!getActiveChat()) {
    chatStore.activeChatId = chatStore.chats[0].id;
    saveStore();
  }
}

async function sendPrompt(promptText) {
  const prompt = String(promptText || "").trim();
  if (!prompt) return;

  persistMessage("user", prompt);
  loadLocalMessages();
  chatInput.value = "";

  const typing = document.createElement("div");
  typing.className = "msg bot";
  typing.textContent = "Thinking...";
  chatArea.appendChild(typing);
  chatArea.scrollTop = chatArea.scrollHeight;

  await new Promise((resolve) => setTimeout(resolve, 450));
  typing.remove();
  const reply = buildLocalReply(prompt);
  persistMessage("bot", reply);
  loadLocalMessages();
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendPrompt(chatInput.value);
});

quickButtons.forEach((button) => {
  button.addEventListener("click", () => sendPrompt(button.dataset.prompt));
});

attachBtn.addEventListener("click", () => {
  addMessage("Attachment feature will be added soon.", "bot");
});

micBtn.addEventListener("click", () => {
  addMessage("Voice input feature will be added soon.", "bot");
});

deleteChatBtn.addEventListener("click", () => {
  clearChatWithAnimation();
});

newChatBtn.addEventListener("click", () => {
  createNewChat();
  chatInput.focus();
});

sidebarToggle.addEventListener("click", () => {
  if (sidebar.classList.contains("open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener("click", () => {
    closeSidebar();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
  }
});

async function initGeminiPage() {
  initStore();
  loadProfileFromLocal();
  startGreetingWordLoop();
  loadLocalMessages();
  renderChatList();

  window.addEventListener("storage", (event) => {
    if (event.key === "cms.settings.v1") {
      loadProfileFromLocal();
    }
    if (event.key === GEMINI_LOCAL_CHAT_KEY) {
      initStore();
      loadLocalMessages();
      renderChatList();
    }
  });
}

initGeminiPage();
