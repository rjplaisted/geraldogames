const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "change-me-in-env";

// ── Security ──────────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        mediaSrc: ["'self'", "data:", "blob:"],
      },
    },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests",
});
app.use(limiter);

// Webhook gets raw body for signature check
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../public")));

// ── Game discovery ────────────────────────────────────────────────────────────
app.get("/api/games", (req, res) => {
  const gamesDir = path.join(__dirname, "../games");
  try {
    const entries = fs.readdirSync(gamesDir, { withFileTypes: true });
    const games = entries
      .filter((e) => e.isDirectory())
      .map((e) => {
        const metaPath = path.join(gamesDir, e.name, "game.json");
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
          return { id: e.name, ...meta };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    res.json(games);
  } catch {
    res.json([]);
  }
});

// Serve individual games
app.use("/games", express.static(path.join(__dirname, "../games")));

// ── Update status ─────────────────────────────────────────────────────────────
let updateStatus = { updating: false, lastUpdate: null, message: "" };

app.get("/api/status", (req, res) => res.json(updateStatus));

// ── Webhook endpoint (GitHub) ─────────────────────────────────────────────────
app.post("/webhook", (req, res) => {
  const sig = req.headers["x-hub-signature-256"];
  if (!sig) return res.status(401).send("No signature");

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(req.body).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest))) {
    return res.status(401).send("Invalid signature");
  }

  const payload = JSON.parse(req.body.toString());
  const branch = (payload.ref || "").replace("refs/heads/", "");
  const targetBranch = process.env.DEPLOY_BRANCH || "main";

  if (branch !== targetBranch) {
    return res.json({ ok: true, message: `Ignoring branch: ${branch}` });
  }

  res.json({ ok: true, message: "Update triggered" });
  triggerUpdate();
});

function triggerUpdate() {
  if (updateStatus.updating) return;
  updateStatus = { updating: true, lastUpdate: null, message: "Pulling latest code…" };
  console.log("[update] Pulling from git…");

  const rootDir = path.join(__dirname, "..");
  exec("git pull", { cwd: rootDir }, (err, stdout, stderr) => {
    if (err) {
      console.error("[update] git pull failed:", stderr);
      updateStatus = { updating: false, lastUpdate: new Date(), message: "Update failed: " + stderr };
      return;
    }
    console.log("[update] git pull ok:", stdout.trim());
    updateStatus = { updating: true, message: "Installing dependencies…" };

    exec("npm install --production", { cwd: rootDir }, (err2) => {
      updateStatus = { updating: false, lastUpdate: new Date(), message: "Up to date ✓" };
      if (err2) {
        console.error("[update] npm install failed:", err2.message);
        updateStatus.message = "Dependency install failed";
      }
      console.log("[update] Done. Restarting via PM2…");
      exec("pm2 restart kidgames", () => {});
    });
  });
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`KidGames running on port ${PORT}`));
