# CLAUDE.md — GeraldoGames Agent Guide

This file is for AI assistants (Claude, Cursor, Copilot, etc.) working in this repo.
Read it before making any changes.

---

## What this project is

A tablet-friendly mini-game hub for a 5-year-old, live at **http://geraldo.games**.

- The menu auto-discovers games by scanning `games/*/game.json`
- Games are self-contained HTML pages in `games/<game-name>/`
- Deployment is fully automatic: push to `main` → GitHub Actions → live site in ~60 sec

---

## Repo structure

```
geraldogames/
├── CLAUDE.md                     ← you are here
├── README.md                     ← human-facing docs
├── .github/
│   └── workflows/
│       └── deploy.yml            ← GitHub Actions auto-deploy (SFTP to PebbleHost)
├── public/
│   ├── index.html                ← game menu (served as public_html/index.html)
│   ├── css/menu.css              ← menu styles
│   └── js/menu.js                ← menu JS (fetches /api/games.php)
├── games/
│   ├── ADDING_GAMES.md           ← guide for adding games (also read this)
│   ├── example-game/
│   │   ├── game.json             ← metadata (name, emoji, description, age range)
│   │   └── index.html            ← the actual game
│   └── firetruck-alphabet/
│       ├── game.json             ← "Firetruck Alphabet!" 🚒 ages 3–7
│       └── index.html            ← bilingual A-Z alphabet game (EN/ES), source: https://github.com/Sunnydalelow/firetruck-alphabet-game
├── api/
│   ├── games.php                 ← PHP: scans games/ and returns JSON list
│   └── status.php                ← PHP: returns static {updating: false} JSON
├── server/
│   └── index.js                  ← Node.js Express server (NOT used in production)
├── ecosystem.config.js           ← PM2 config (NOT used — shared hosting only)
├── package.json                  ← Node deps (express, helmet, rate-limit)
└── .env                          ← local secrets (gitignored)
```

---

## Hosting environment — CRITICAL

**This is shared web hosting (PebbleHost), NOT a VPS.**

| Capability | Status |
|-----------|--------|
| Node.js / PM2 | ❌ Not available |
| SSH shell access | ❌ Disabled |
| PHP | ✅ Available (serves the API) |
| SFTP | ✅ Available (how files are uploaded) |
| Auto-deploy | ✅ Via GitHub Actions → lftp SFTP |

**The `server/` directory and `ecosystem.config.js` are kept for reference only** — they would be used if moving to a VPS. Do NOT try to run `npm start` or `pm2` in any deployment commands.

The live web root is `/home/geraldog/public_html/` on the server.

---

## How deployment works

```
git push main
  → GitHub Actions (.github/workflows/deploy.yml)
  → apt-get install lftp
  → lftp SFTP mirror:
      public/  → /home/geraldog/public_html/
      games/   → /home/geraldog/public_html/games/
      api/     → /home/geraldog/public_html/api/
  → site live at http://geraldo.games (~60 seconds total)
```

**GitHub Secret required:** `DEPLOY_PASS` = the PebbleHost cPanel/SFTP password.
This is already configured in the repo settings. Do not change or expose it.

---

## How to add a new game

1. Create `games/<slug>/game.json`:
```json
{
  "name": "My Cool Game",
  "description": "1–2 sentences shown on the menu card.",
  "emoji": "🦄",
  "minAge": 3,
  "maxAge": 7,
  "tags": ["counting", "colors", "shapes"]
}
```

2. Create `games/<slug>/index.html` — the complete, self-contained game.

3. Push to `main`. The game appears on the menu automatically.

### Rules for game HTML

- **Always include a home button:** `<a href="/">🏠</a>` (min 80×80px touch target)
- **No external CDN dependencies** — keep everything inline or in the game folder
- **Large touch targets** — min 80×80px buttons (played on a tablet)
- **Min font size 1.2rem** — for a young child
- **Save scores:** `localStorage.setItem("kidgames_stars", count)` — feeds the ⭐ counter on the menu
- **Test both portrait and landscape orientations**
- **Self-contained** — the game folder should include all its own assets

### Color palette (matches the menu theme)

```css
--coral:  #ff6b6b  /* red */
--yellow: #ffd93d
--grass:  #6bcb77  /* green */
--purple: #a855f7
--sky:    #67e0f5  /* background */
```

---

## API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/games.php` | GET | Returns JSON array of all games (from `game.json` files) |
| `/api/status.php` | GET | Returns `{"updating": false}` (static on shared hosting) |
| `/games/<slug>/` | GET | Serves the game's `index.html` |

The menu JS (`public/js/menu.js`) calls `/api/games.php` to build the game cards.

---

## Local development

The site can be previewed locally using Node.js:

```bash
npm install
npm run dev    # nodemon server/index.js — serves on http://localhost:3000
```

The local Node.js server reads from the same `games/` directory and serves the
same `public/` files, so development matches production closely.

**Note:** locally the API is `/api/games` (Express route); on production it's
`/api/games.php` (PHP). The `public/js/menu.js` points to the PHP endpoint
(`.php` suffix) which works in both environments if you have PHP available,
or you can switch to the Express endpoint for local testing.

---

## What NOT to do

- ❌ Do not modify `server/index.js` and expect it to run on production
- ❌ Do not add `node_modules/` to git
- ❌ Do not commit `.env` (it's gitignored — contains real credentials)
- ❌ Do not add CDN links to game HTML (may break offline / on slow connections)
- ❌ Do not add external images/sounds to games without self-hosting them in the game folder
- ❌ Do not change `DEPLOY_PASS` secret name in the workflow without updating GitHub Secrets

---

## Key files for LLMs

| Task | File(s) to read/edit |
|------|---------------------|
| Add a game | `games/ADDING_GAMES.md`, then create new folder |
| Change menu appearance | `public/css/menu.css`, `public/index.html` |
| Change menu behavior | `public/js/menu.js` |
| Change game discovery logic | `api/games.php` |
| Change deployment | `.github/workflows/deploy.yml` |
| Understand the full system | This file + `README.md` |
