# Online UNO

Production-quality online multiplayer UNO built with React, Node.js, Socket.IO, and Firebase.

## Structure

| Package   | Role                                      |
| --------- | ----------------------------------------- |
| `client/` | React + Vite + Tailwind PWA frontend      |
| `server/` | Express + Socket.IO authoritative backend |
| `shared/` | Shared types, constants, and game types   |

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase project (Milestone 2+)

## Setup

```bash
npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Fill in Firebase keys in `client/.env` — see [docs/firebase-setup.md](docs/firebase-setup.md).

## Development

```bash
# Client (5173) + server (3001)
npm run dev

# Client only
npm run dev:client

# Server only
npm run dev:server
```

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run build`   | Build shared, client, server |
| `npm run lint`    | ESLint client + server     |
| `npm run format`  | Prettier write             |

See [PROJECT.md](PROJECT.md) for architecture and milestone status.

## Milestones

1. Project setup ✓
2. Authentication ✓
3. Room system
4. UNO engine
5. Socket integration
6. Frontend game UI
7. Animations
8. Sounds
9. Firestore statistics
10. Deployment (Vercel + Render)

## License

Private — all rights reserved.
