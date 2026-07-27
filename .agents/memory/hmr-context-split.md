---
name: HMR context split fix
description: Why shared package recompile breaks React contexts in dev and how it's fixed
---

The shared package uses `tsc --watch` alongside Vite dev server. When shared/dist recompiles, Vite HMR hot-reloads RoomContext.tsx and GameContext.tsx, creating NEW `createContext()` objects. Old consumers still hold references to the old ones → "must be used within Provider" crash.

**Fix applied:** `fullReloadOnShared` Vite plugin in `client/vite.config.ts` — forces a full-page reload (instead of partial HMR) whenever a file inside `/shared/dist/` changes.

**Why:** Partial HMR of context provider modules creates a split where provider and consumer use different context object references. Full reload resets everything consistently.

**How to apply:** Any time context files are HMR-invalidated due to shared package changes, this plugin is already active. If new context files are added, they don't need special handling since the full-reload covers all files.
