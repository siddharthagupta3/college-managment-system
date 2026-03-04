function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../signup/singup.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  const tabs = document.querySelectorAll(".game-tab");
  const panels = document.querySelectorAll(".game-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const game = tab.dataset.game;
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(`game${game.charAt(0).toUpperCase() + game.slice(1)}`).classList.add("active");
    });
  });

  initMemoryGame();
  initSequenceGame();
  initReactionGame();
});

// Memory Grid
function initMemoryGame() {
  const grid = document.getElementById("memoryGrid");
  const statusEl = document.getElementById("memoryStatus");
  const symbols = ["★", "◆", "●", "▲", "■", "♥", "♣", "♠"];
  let cards = [];
  let opened = [];
  let solved = 0;

  function setup() {
    cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, matched: false }));
    opened = [];
    solved = 0;
    render();
    statusEl.textContent = "Find all matching pairs.";
  }

  function onCardClick(idx) {
    const card = cards[idx];
    if (!card || card.matched) return;
    if (opened.find((o) => o.id === card.id)) return;
    if (opened.length === 2) return;
    opened.push(card);
    render();
    if (opened.length === 2) {
      const [a, b] = opened;
      if (a.symbol === b.symbol) {
        cards[a.id].matched = true;
        cards[b.id].matched = true;
        solved += 2;
        opened = [];
        render();
        if (solved === cards.length) {
          statusEl.textContent = "Excellent memory! All pairs found.";
        }
      } else {
        setTimeout(() => {
          opened = [];
          render();
        }, 700);
      }
    }
  }

  function render() {
    grid.innerHTML = "";
    cards.forEach((card, idx) => {
      const div = document.createElement("div");
      div.className = "memory-card";
      const isOpen = opened.find((o) => o.id === card.id);
      if (card.matched || isOpen) {
        div.textContent = card.symbol;
        div.classList.add("open");
      }
      div.addEventListener("click", () => onCardClick(idx));
      grid.appendChild(div);
    });
  }

  setup();
}

// Sequence Game
function initSequenceGame() {
  const display = document.getElementById("sequenceDisplay");
  const startBtn = document.getElementById("startSequence");
  const repeatBtn = document.getElementById("repeatSequence");
  const statusEl = document.getElementById("sequenceStatus");

  let sequence = [];
  let userInput = [];

  function randomSymbol() {
    const pool = ["▲", "●", "■", "◆"];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function showSequence() {
    display.textContent = "";
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= sequence.length) {
        clearInterval(interval);
        statusEl.textContent = "Now type the pattern you saw (e.g. ▲●■)";
        return;
      }
      display.textContent = sequence.slice(0, idx + 1).join("");
      idx += 1;
    }, 500);
  }

  startBtn.addEventListener("click", () => {
    sequence = Array.from({ length: 6 }, randomSymbol);
    userInput = [];
    statusEl.textContent = "Watch the pattern closely.";
    showSequence();
  });

  repeatBtn.addEventListener("click", () => {
    if (!sequence.length) return;
    showSequence();
  });

  display.addEventListener("click", () => {
    if (!sequence.length) return;
    const attempt = prompt("Type the full pattern:");
    if (!attempt) return;
    userInput = attempt.split("");
    if (userInput.join("") === sequence.join("")) {
      statusEl.textContent = "Great focus! Pattern matched perfectly.";
    } else {
      statusEl.textContent = "Not quite right. Try again or repeat the pattern.";
    }
  });
}

// Reaction Game
function initReactionGame() {
  const box = document.getElementById("reactionBox");
  const statusEl = document.getElementById("reactionStatus");
  let waiting = false;
  let startTime = 0;

  function schedule() {
    waiting = true;
    box.classList.remove("go");
    box.textContent = "Wait for green...";
    statusEl.textContent = "";
    const delay = 1000 + Math.random() * 3000;
    setTimeout(() => {
      if (!waiting) return;
      box.classList.add("go");
      box.textContent = "CLICK!";
      startTime = performance.now();
    }, delay);
  }

  box.addEventListener("click", () => {
    if (!waiting) {
      schedule();
      return;
    }
    if (!box.classList.contains("go")) {
      statusEl.textContent = "Too early! Wait for green.";
      waiting = false;
      return;
    }
    const end = performance.now();
    const ms = Math.round(end - startTime);
    statusEl.textContent = `Reaction time: ${ms} ms`;
    waiting = false;
  });

  schedule();
}

