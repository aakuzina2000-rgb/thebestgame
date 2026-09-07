const ACCESS_CODE = "indonesia";
const MAX_LIVES = 3;

const SAVE_KEY = "thebestgame_save_v1";

function loadSave() {
  const fallback = {
    version: 1,
    playerName: "",
    debt: 0,
    debtEvents: [],
    lives: MAX_LIVES,
    parts: {
      indonesia: {
        unlocked: true,
        completed: false,
        minigames: {
          tinder: {
            unlocked: true,
            completed: false,
            attempts: 0,
            bestLivesLeft: 0
          },
          game2: { unlocked: false, completed: false },
          game3: { unlocked: false, completed: false }
        }
      },
      moscow: {
        unlocked: false,
        completed: false,
        minigames: {}
      }
    }
  };

  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return fallback;
    return {
      ...fallback,
      ...saved,
      parts: {
        ...fallback.parts,
        ...(saved.parts || {}),
        indonesia: {
          ...fallback.parts.indonesia,
          ...(saved.parts?.indonesia || {}),
          minigames: {
            ...fallback.parts.indonesia.minigames,
            ...(saved.parts?.indonesia?.minigames || {})
          }
        }
      }
    };
  } catch {
    return fallback;
  }
}

const savedProfile = loadSave();

const state = {
  ...savedProfile,
  lives: MAX_LIVES,
  currentProfile: 0
};

const profiles = [
  {
    name: "Dracarys",
    age: 327,
    image: "assets/dragon.jpg",
    bio: "Owns property. Emotionally available. Breathes fire when annoyed.",
    meta: "Canggu • 3 km away",
    like: { type: "life", text: "It's a match. She introduced you to her 14 children. -1 life." },
    nope: { type: "safe", text: "Good call. Your eyebrows remain intact." }
  },
  {
    name: "Bear",
    age: 12,
    image: "assets/bear.jpg",
    bio: "6'2. Loves hiking. Sleeps through winter. Looking for someone outdoorsy.",
    meta: "Ubud • 18 km away",
    like: { type: "life", text: "The date was going well until he remembered he is a bear. -1 life." },
    nope: { type: "safe", text: "Reasonable." }
  },
  {
    name: "Chad",
    age: 29,
    image: "assets/chad.jpg",
    bio: "Open-minded. Yoga at sunrise. 'Just seeing what happens.'",
    meta: "Seminyak • 5 km away",
    like: { type: "life", text: "Unexpected plot twist. Not your target audience. -1 life." },
    nope: { type: "safe", text: "Mission remains unchanged." }
  },
  {
    name: "Bella",
    age: 24,
    image: "assets/bella.jpg",
    bio: "47 countries ✈️ Brunch. Pilates. Don't waste my time.",
    meta: "Canggu • 1 km away",
    like: { type: "life", text: "Dinner bill: 4,850,000 IDR. Your wallet did not survive. -1 life." },
    nope: { type: "safe", text: "Your bank account thanks you." }
  },
  {
    name: "Alien Girl",
    age: 1042,
    image: "assets/alien.jpg",
    bio: "New to Earth. Looking for a local guide and possibly a specimen.",
    meta: "Bali? • 0 km away",
    like: { type: "life", text: "You have been selected for research. -1 life." },
    nope: { type: "safe", text: "Earth keeps one more citizen." }
  },
  {
    name: "Anastasia",
    age: 24,
    image: "assets/anastasia_placeholder.jpg",
    bio: "This text will later be replaced with the real bio / joke / detail from when you met.",
    meta: "Bali • very close",
    isFinal: true,
    like: { type: "match", text: "Finally." },
    nope: { type: "return", text: "Excuse me? Try that again." }
  }
];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function saveState() {
  const data = {
    version: state.version,
    playerName: state.playerName,
    debt: state.debt,
    debtEvents: state.debtEvents,
    parts: state.parts
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function renderProgress() {
  const indonesia = state.parts.indonesia;
  const games = Object.values(indonesia.minigames);
  const completed = games.filter(g => g.completed).length;
  const total = games.length;

  document.querySelectorAll(".indonesia-progress").forEach(el => {
    el.textContent = `${completed}/${total} mini-games completed`;
  });

  const tinderStatus = document.getElementById("tinder-status");
  if (tinderStatus) {
    tinderStatus.textContent = indonesia.minigames.tinder.completed ? "✓ COMPLETE" : "PLAY →";
  }

  const tinderCard = document.getElementById("open-tinder");
  if (tinderCard && indonesia.minigames.tinder.completed) {
    tinderCard.classList.add("completed");
  }
}

function renderDebt() {
  document.getElementById("debt-top").textContent = state.debt;
  document.querySelectorAll(".debt-any").forEach(el => el.textContent = state.debt);
  document.getElementById("debt-big").textContent = state.debt;

  const history = document.getElementById("debt-history");
  if (!state.debtEvents.length) {
    history.textContent = "No debt. Suspiciously responsible.";
  } else {
    history.innerHTML = state.debtEvents
      .slice(-5)
      .reverse()
      .map((e, i) => `<div>🥐 ${e}</div>`)
      .join("");
  }
}

function renderLives() {
  document.getElementById("lives").textContent =
    "❤️".repeat(state.lives) + "🖤".repeat(MAX_LIVES - state.lives);
}

function loseLife(reason) {
  state.lives -= 1;
  renderLives();

  if (state.lives <= 0) {
    state.debt += 1;
    state.debtEvents.push(`+1 pain au chocolat — ${reason}`);
    state.lives = MAX_LIVES;
    saveState();
    renderDebt();
    renderLives();
    return `NO LIVES LEFT. Lives restored. You now owe Anastasia +1 pain au chocolat. 🥐`;
  }

  saveState();
  return reason;
}

function renderProfile() {
  const stack = document.getElementById("card-stack");
  stack.innerHTML = "";

  const p = profiles[state.currentProfile];
  if (!p) return;

  const card = document.createElement("div");
  card.className = "profile-card";
  card.innerHTML = `
    <div class="profile-visual"><img src="${p.image}" alt="${p.name}"></div>
    <div class="profile-copy">
      <h3>${p.name}, ${p.age}</h3>
      <p>${p.bio}</p>
      <div class="profile-meta">${p.meta}</div>
    </div>
  `;

  stack.appendChild(card);
  attachDrag(card);
}

function nextProfile() {
  state.currentProfile += 1;
  if (state.currentProfile >= profiles.length) {
    state.currentProfile = profiles.length - 1;
  }
  renderProfile();
}

function swipe(direction) {
  const p = profiles[state.currentProfile];
  if (!p) return;

  const action = direction === "right" ? p.like : p.nope;
  const msg = document.getElementById("game-message");

  if (p.isFinal && direction === "left") {
    msg.textContent = action.text;
    const card = document.querySelector(".profile-card");
    if (card) {
      card.animate(
        [
          { transform: "translateX(-12px) rotate(-2deg)" },
          { transform: "translateX(12px) rotate(2deg)" },
          { transform: "translateX(0) rotate(0)" }
        ],
        { duration: 330 }
      );
    }
    return;
  }

  const card = document.querySelector(".profile-card");
  if (card) {
    card.style.transform =
      direction === "right"
        ? "translateX(150%) rotate(20deg)"
        : "translateX(-150%) rotate(-20deg)";
    card.style.opacity = "0";
  }

  if (action.type === "life") {
    msg.textContent = loseLife(action.text);
  } else if (action.type === "match") {
    msg.textContent = action.text;
    setTimeout(() => showScreen("screen-match"), 320);
    return;
  } else {
    msg.textContent = action.text;
  }

  setTimeout(nextProfile, 280);
}

function attachDrag(card) {
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  const start = (x) => {
    dragging = true;
    startX = x;
    card.style.transition = "none";
  };

  const move = (x) => {
    if (!dragging) return;
    currentX = x - startX;
    const rotate = currentX / 18;
    card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
  };

  const end = () => {
    if (!dragging) return;
    dragging = false;
    card.style.transition = "transform .25s ease, opacity .25s ease";

    if (currentX > 95) swipe("right");
    else if (currentX < -95) swipe("left");
    else card.style.transform = "translateX(0) rotate(0)";

    currentX = 0;
  };

  card.addEventListener("pointerdown", e => {
    card.setPointerCapture(e.pointerId);
    start(e.clientX);
  });
  card.addEventListener("pointermove", e => move(e.clientX));
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", end);
}

document.getElementById("login-btn").addEventListener("click", () => {
  const name = document.getElementById("player-name").value.trim();
  const code = document.getElementById("access-code").value.trim();
  const error = document.getElementById("login-error");

  if (!name) {
    error.textContent = "Enter player name.";
    return;
  }

  if (code.toLowerCase() !== ACCESS_CODE) {
    error.textContent = "ACCESS DENIED";
    return;
  }

  state.playerName = name;
  saveState();
  document.getElementById("home-player").textContent = name;
  error.textContent = "";
  showScreen("screen-home");
});

document.querySelector('[data-part="indonesia"]').addEventListener("click", () => {
  showScreen("screen-indonesia");
});

const mapIndonesia = document.getElementById("map-indonesia");
if (mapIndonesia) mapIndonesia.addEventListener("click", () => {
  showScreen("screen-indonesia");
});
const svgIndonesia = document.getElementById("svg-indonesia");
if (svgIndonesia) svgIndonesia.addEventListener("click", () => showScreen("screen-indonesia"));

document.querySelectorAll(".back-home").forEach(btn => {
  btn.addEventListener("click", () => showScreen("screen-home"));
});

document.getElementById("open-tinder").addEventListener("click", () => {
  state.parts.indonesia.minigames.tinder.attempts += 1;
  saveState();
  state.currentProfile = 0;
  state.lives = MAX_LIVES;
  renderLives();
  renderProfile();
  document.getElementById("game-message").textContent = "Swipe or use the buttons.";
  showScreen("screen-tinder");
});

document.getElementById("back-indonesia").addEventListener("click", () => {
  showScreen("screen-indonesia");
});

document.getElementById("nope-btn").addEventListener("click", () => swipe("left"));
document.getElementById("like-btn").addEventListener("click", () => swipe("right"));

document.getElementById("finish-tinder").addEventListener("click", () => {
  const tinder = state.parts.indonesia.minigames.tinder;
  tinder.completed = true;
  tinder.bestLivesLeft = Math.max(tinder.bestLivesLeft || 0, state.lives);
  state.parts.indonesia.minigames.game2.unlocked = true;
  saveState();
  renderProgress();
  showScreen("screen-indonesia");
});

document.querySelectorAll(".debt-open, #debt-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    renderDebt();
    document.getElementById("debt-modal").classList.remove("hidden");
  });
});

document.getElementById("close-debt").addEventListener("click", () => {
  document.getElementById("debt-modal").classList.add("hidden");
});

document.getElementById("debt-modal").addEventListener("click", (e) => {
  if (e.target.id === "debt-modal") {
    document.getElementById("debt-modal").classList.add("hidden");
  }
});

if (state.playerName) {
  document.getElementById("player-name").value = state.playerName;
}
document.getElementById("home-player").textContent = state.playerName || "—";
renderDebt();
renderLives();

renderProgress();
