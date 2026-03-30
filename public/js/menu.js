/* ── Star counter ───────────────────────────────────────────── */
function updateStarDisplay() {
  const count = parseInt(localStorage.getItem("kidgames_stars") || "0", 10);
  const stars = Math.min(count, 10);
  document.getElementById("star-display").textContent = "⭐".repeat(Math.max(stars, 1));
}

/* ── Game grid ──────────────────────────────────────────────── */
async function loadGames() {
  const grid = document.getElementById("game-grid");
  try {
    const res = await fetch("/api/games.php");
    const games = await res.json();

    if (!games.length) {
      grid.innerHTML = '<div class="loading-games">No games yet — check back soon! 🎲</div>';
      return;
    }

    grid.innerHTML = "";
    games.forEach((game) => {
      const card = document.createElement("a");
      card.className = "game-card";
      card.href = `/games/${game.id}/`;
      card.innerHTML = `
        <div class="game-emoji">${game.emoji || "🎮"}</div>
        <div class="game-name">${game.name}</div>
        <div class="game-desc">${game.description || ""}</div>
        <div class="play-btn">▶ Play</div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<div class="loading-games">Couldn\'t load games 😢 Try refreshing!</div>';
    console.error("Failed to load games:", err);
  }
}

/* ── Update / loading overlay ───────────────────────────────── */
const overlay = document.getElementById("update-overlay");
const updateMsg = document.getElementById("update-message");
let pollInterval = null;

async function checkStatus() {
  try {
    const res = await fetch("/api/status.php");
    const status = await res.json();

    if (status.updating) {
      overlay.classList.remove("hidden");
      updateMsg.textContent = status.message || "Just a moment…";
    } else {
      if (!overlay.classList.contains("hidden")) {
        // Was updating, now done — reload games and hide overlay
        overlay.classList.add("hidden");
        loadGames();
      }
    }
  } catch {
    // Only keep showing overlay if an update was already in progress
    if (!overlay.classList.contains("hidden")) {
      updateMsg.textContent = "Restarting… almost there! 🚀";
    }
  }
}

function startPolling() {
  if (pollInterval) return;
  pollInterval = setInterval(checkStatus, 2500);
}

/* ── Last-update timestamp ──────────────────────────────────── */
async function loadLastUpdate() {
  try {
    const res = await fetch("/api/status.php");
    const status = await res.json();
    if (status.lastUpdate) {
      const el = document.getElementById("last-update");
      if (el) {
        const d = new Date(status.lastUpdate);
        const fmt = d.toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "numeric", minute: "2-digit", hour12: true
        });
        el.textContent = `Updated ${fmt}`;
        el.title = d.toISOString();
      }
    }
  } catch {
    // silently skip — timestamp is non-critical
  }
}

/* ── Init ───────────────────────────────────────────────────── */
updateStarDisplay();
loadGames();
loadLastUpdate();
startPolling();

// Refresh star count whenever the tab regains focus (kid just finished a game)
window.addEventListener("focus", updateStarDisplay);
