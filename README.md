# 🌟 GeraldoGames

A tablet-friendly mini-game hub for little learners. Games auto-deploy when you push to `main`.

Live at: **http://www.geraldo.games**

## Repo structure

```
geraldogames/
├── server/
│   └── index.js          ← Express server + webhook handler
├── public/
│   ├── index.html        ← Main menu
│   ├── css/menu.css
│   └── js/menu.js
├── games/
│   ├── ADDING_GAMES.md   ← Guide for adding new games
│   └── example-game/     ← Sample colour-tap game
├── ecosystem.config.js   ← PM2 config
├── package.json
└── .env.example
```

---

## 🚀 Server setup (one-time)

Tested on Ubuntu 22.04 / Debian 12.

### 1. Install Node & PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### 2. Clone & install

```bash
git clone https://github.com/rjplaisted/geraldogames.git
cd geraldogames
npm install --production
```

### 3. Set environment variables

```bash
cp .env.example .env
nano .env          # fill in WEBHOOK_SECRET with a random string
```

Generate a strong secret:

```bash
openssl rand -hex 32
```

Then load them before PM2:

```bash
export $(cat .env | xargs)
pm2 start ecosystem.config.js
pm2 save
pm2 startup         # follow the printed command to survive reboots
```

### 4. Configure GitHub webhook

In your GitHub repo → **Settings → Webhooks → Add webhook**:

| Field          | Value                                        |
|----------------|----------------------------------------------|
| Payload URL    | `http://51.89.244.99:3000/webhook`           |
| Content type   | `application/json`                           |
| Secret         | Same value as your `WEBHOOK_SECRET`          |
| Events         | Just the **push** event                      |

> 💡 Point nginx/caddy at port 3000 and use HTTPS for production.

---

## 🔒 Security notes

- **Webhook** is verified with HMAC-SHA256 — only GitHub (with the secret) can trigger updates.
- **Helmet** sets secure HTTP headers automatically.
- **Rate limiting** blocks >200 requests per 15 min per IP.
- The server runs as a non-root PM2 process.
- No passwords or user accounts needed — this is a family server.

### Optional: Nginx reverse proxy (recommended for HTTPS)

```nginx
server {
    listen 80;
    server_name geraldo.games www.geraldo.games;
    location / { proxy_pass http://localhost:3000; }
}
```

---

## 🎮 Adding new games

See [`games/ADDING_GAMES.md`](games/ADDING_GAMES.md).

**Quick summary:** Create a folder in `games/`, add `game.json` + `index.html`, push to `main` — it appears on the menu automatically.

---

## 🔄 Auto-deploy flow

```
git push → GitHub webhook → /webhook endpoint
  → git pull → npm install → pm2 restart
  → loading screen shown to players during restart
  → page refreshes content automatically when server is back
```

---

## Local development

```bash
npm run dev   # nodemon watches for changes
```

Open http://localhost:3000
