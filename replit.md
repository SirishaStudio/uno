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

## Running on Replit

The combined dev workflow starts both services:

```bash
npm run dev
```

- **Client** → `http://localhost:5000` (Vite; proxies `/health` and `/socket.io` → server)
- **Server** → `http://localhost:3001` (Express)

The Vite proxy means the browser only needs one origin in dev.

## Environment variables

### Client (`client/.env`)

| Variable                        | Required | Notes                          |
|---------------------------------|----------|--------------------------------|
| `VITE_API_URL`                  | No       | Leave empty — uses Vite proxy  |
| `VITE_SOCKET_URL`               | No       | Leave empty — uses Vite proxy  |
| `VITE_FIREBASE_API_KEY`         | Yes      | Firebase project settings      |
| `VITE_FIREBASE_AUTH_DOMAIN`     | Yes      |                                |
| `VITE_FIREBASE_PROJECT_ID`      | Yes      |                                |
| `VITE_FIREBASE_STORAGE_BUCKET`  | Yes      |                                |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes  |                                |
| `VITE_FIREBASE_APP_ID`          | Yes      |                                |

See `docs/firebase-setup.md` for how to get these values.

### Server (`server/.env`)

| Variable           | Default                    |
|--------------------|----------------------------|
| `PORT`             | 3001                       |
| `CLIENT_ORIGIN`    | http://localhost:5000      |
| `NODE_ENV`         | development                |

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
