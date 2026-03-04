var API_BASE = window.API_BASE || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function appendAiMessage(role, text) {
  const wrap = document.getElementById("aiMessages");
  if (!wrap) return;
  const div = document.createElement("div");
  div.className = `ai-msg ai-${role}`;
  div.textContent = text;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aiForm");
  const input = document.getElementById("aiInput");

  if (!getToken()) {
    window.location.href = "../signup/singup.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendAiMessage("user", text);
    input.value = "";

    try {
      var res = await fetch(API_BASE + "/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        appendAiMessage("bot", data.message || "AI error");
        return;
      }
      appendAiMessage("bot", data.reply || "(no response)");
    } catch (err) {
      console.error(err);
      appendAiMessage("bot", "Unable to contact AI service.");
    }
  });
});

