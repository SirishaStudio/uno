# Online UNO — Project Tracker

## Current milestone

**Milestone 2 — Authentication** (complete)

Next: **Milestone 3 — Room system** (pending approval)

---

## Completed features

| Milestone | Features |
|-----------|----------|
| M1 | Monorepo, Vite/React/Tailwind, Express + Socket.IO shell, shared types, page routes, PWA scaffold, ESLint/Prettier |
| M2 | Firebase config, Google login, guest (anonymous) login, Firestore user profiles, `AuthContext`, protected routes, profile UI, display name validation |

---

## Pending features

- M3: Create/join room, room codes, waiting lobby, ready state
- M4: Authoritative UNO engine
- M5: Socket integration + server auth
- M6: Full game UI
- M7: Animations
- M8: Sound + settings persistence
- M9: Statistics updates after matches
- M10: Deployment guides (Vercel, Render)

---

## Folder structure

```
online-uno/
├── client/          # React PWA
├── server/          # Express + Socket.IO
├── shared/          # Types & constants
└── docs/            # Milestones, Firebase, rules
```

---

## Architecture

- **Client:** UI only; auth via Firebase SDK; game state from server (later).
- **Server:** Authoritative game + rooms (M3–M5); will verify Firebase ID tokens on sockets (M5).
- **Shared:** Cross-package TypeScript types and game constants.
- **Firestore:** `users/{uid}` player profiles; match stats updated server-side in M9.

---

## Socket events

| Event | Status |
|-------|--------|
| `connection` / `disconnect` | Implemented (logging only) |
| Room & game events | Milestone 3 / 5 |

---

## Database schema

### Collection: `users`

| Field | Type | Notes |
|-------|------|--------|
| `uid` | string | Document ID = uid |
| `displayName` | string | 2–16 chars (client validated) |
| `photoURL` | string \| null | Google avatar |
| `gamesPlayed` | number | Default 0; server updates in M9 |
| `gamesWon` | number | Default 0 |
| `winPercentage` | number | Default 0 |
| `totalScore` | number | Default 0 |
| `isGuest` | boolean | Anonymous auth |
| `createdAt` | timestamp | Server timestamp on create |
| `updatedAt` | timestamp | On profile sync |

Rules: `docs/firestore.rules`

---

## Deployment notes

Not deployed yet. See future M10 for Vercel (client) and Render (server). Firebase hosts Auth + Firestore.

---

## Milestone 2 — Testing

See `docs/milestones/MILESTONE-2.md`.
