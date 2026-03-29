# 🎮 Adding a New Game

Each game lives in its own folder inside `games/`.

## Folder structure

```
games/
  my-new-game/
    game.json       ← required: metadata shown on the menu
    index.html      ← required: the actual game
    (any other assets: css, js, images, sounds...)
```

## game.json fields

```json
{
  "name":        "My Cool Game",
  "description": "Short description shown on the menu card (1–2 sentences)",
  "emoji":       "🦄",
  "minAge":      3,
  "maxAge":      7,
  "tags":        ["letters", "counting", "shapes"]
}
```

## Tips for Claude Code

1. Keep everything self-contained in the game folder — no external CDN
   dependencies that might break offline.
2. Always include a 🏠 home button linking back to `/`.
3. Use large touch targets (min 80×80px buttons) — this is played on a tablet.
4. Avoid tiny text. Min font size ~1.2rem.
5. Store scores with `localStorage.setItem("kidgames_stars", count)` to feed
   the star counter on the main menu.
6. Test landscape AND portrait orientations.

## Deploying

Push to the `main` branch → GitHub webhook fires → server auto-pulls & restarts.
