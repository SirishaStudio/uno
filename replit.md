# Online UNO

Production-quality online multiplayer UNO — React PWA frontend + Node.js/Socket.IO backend.

## Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4, Framer Motion, PWA |
| Backend   | Node.js 20, Express, Socket.IO               |
| Auth      | Firebase Authentication (Google + Anonymous) |
| Database  | Firestore (player statistics)                |
| Shared    | TypeScript types & constants (npm workspace) |

## Repo layout

```
online-uno/
├── client/   – React PWA (Vite, port 5000 in dev)
├── server/   – Express + Socket.IO (port 3001)
├── shared/   – Shared TS types & game constants
└── docs/     – Firebase setup, Firestore rules, milestone notes
```

## First-time setup on Replit

```bash
npm install            # hydrates node_modules from package-lock.json
cp client/.env.example client/.env
cp server/.env.example server/.env
# then fill in Firebase credentials — see below
```

Hit **Run** (or `npm run dev`). Both services start together:

- **Client** → port 5000 (Vite; proxies `/health` and `/socket.io` to the server)
- **Server** → port 3001 (Express + Socket.IO)

The Vite proxy means the browser only needs one origin in dev — leave `VITE_API_URL` and `VITE_SOCKET_URL` empty.

## Environment variables

### Firebase credentials (required for auth to work)

Add these as **Replit Secrets** (padlock icon → Secrets) rather than committing them:

| Secret name                           | Where to find it               |
|---------------------------------------|--------------------------------|
| `VITE_FIREBASE_API_KEY`               | Firebase Console → Project settings → General → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN`           | same                           |
| `VITE_FIREBASE_PROJECT_ID`            | same                           |
| `VITE_FIREBASE_STORAGE_BUCKET`        | same                           |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`   | same                           |
| `VITE_FIREBASE_APP_ID`                | same                           |

See `docs/firebase-setup.md` for full Firebase project setup instructions.

Also copy the values into `client/.env` locally so Vite can pick them up in dev.

### Server env (`server/.env`)

| Variable           | Default                    |
|--------------------|----------------------------|
| `PORT`             | 3001                       |
| `CLIENT_ORIGIN`    | http://localhost:5000      |
| `NODE_ENV`         | development                |

These are already set in `.replit [userenv]` and require no extra action on Replit.

## Milestones

| # | Feature                     | Status     |
|---|-----------------------------|------------|
| 1 | Project scaffolding         | ✅ Done    |
| 2 | Firebase Auth & profiles    | ✅ Done    |
| 3 | Room system                 | 🔜 Next    |
| 4 | UNO game engine             | Pending    |
| 5 | Socket integration + auth   | Pending    |
| 6 | Game UI                     | Pending    |
| 7 | Animations                  | Pending    |
| 8 | Sounds & settings           | Pending    |
| 9 | Firestore statistics        | Pending    |
| 10| Deployment (Vercel + Render)| Pending    |

## Development rules

- Never duplicate code — use shared types, reusable components
- Never hardcode secrets — all config via env vars
- Keep game logic server-side; UI logic separate from engine
- Server always validates game actions
- TypeScript throughout; no `any`

## Deployment targets

- **Frontend** → Vercel (`client/` package)
- **Backend** → Render (`server/` package)
- Firebase hosts Auth + Firestore

## User preferences

- Premium modern UI, dark theme, mobile-first
- Use CSS transforms and Framer Motion — no WebGL/3D
- Official UNO rules only, 2–10 players
- Explain every change: what, why, and which files were modified
