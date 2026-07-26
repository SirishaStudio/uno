# Milestone 1 — Project setup

## Completed

- npm workspaces monorepo: `client`, `server`, `shared`
- React 19 + Vite 6 + Tailwind CSS 4 + React Router 7
- PWA plugin scaffold (manifest, service worker via `vite-plugin-pwa`)
- Express + Socket.IO server with `/health` and connection logging
- Shared package: game constants + core TypeScript types
- ESLint (flat config) + Prettier at repo root
- Page route stubs for all required screens
- Dark UNO-inspired design tokens

## Modified / added files

See git status after first commit. Key roots:

- `package.json`, `README.md`, `.gitignore`, `.prettierrc`
- `shared/src/**`
- `server/src/**`, `server/.env.example`
- `client/**` (Vite app, pages, components, styles)

## How to test

1. Install [Node.js 20+](https://nodejs.org/) if not already installed (required on your machine).
2. From `C:\Users\rao\Projects\online-uno`:

```powershell
npm install
Copy-Item client\.env.example client\.env
Copy-Item server\.env.example server\.env
npm run build -w shared
npm run dev
```

3. Open `http://localhost:5173` — splash → login → use “Skip to home (dev preview)” to browse routes.
4. Open `http://localhost:3001/health` — expect `{ "ok": true, "app": "Online UNO", ... }`.
5. Start server only and watch console for `[socket] connected` when the client connects (after Milestone 5).

```powershell
npm run lint
npm run build
```

## Next milestone

**Milestone 2 — Authentication**: Firebase project, Google + guest login, `AuthContext`, protected routes, display name.

---

Stop here until you approve continuing to Milestone 2.
