# UNO — no login, just play

Real-time multiplayer UNO. Enter a name, share a 5-character room code, play. No accounts, no lag.

## Why two moving parts

Vercel's serverless functions don't hold long-lived connections, so a plain
WebSocket server can't live there. This project splits cleanly:

- **Next.js (App Router)** — the UI. Deploys to Vercel with zero config.
- **PartyKit** — the realtime room server. One PartyKit "room" = one game
  room. It holds the authoritative game state (deck, hands, turn order) in
  memory and pushes updates to every connected player over WebSockets.
  PartyKit deploys independently (to Cloudflare's edge) with one command and
  has a generous free tier — perfect for a hackathon.

The browser only ever sees its own hand; everyone else's card counts are
public but their actual cards never leave the server. That's what makes
"draw pile" and "opponent's hand" trustworthy instead of just client state.

## Project layout

```
app/                 Next.js pages (landing, /room/[code])
components/          UI: Card, Hand, DrawPile, DirectionIndicator, etc.
lib/
  types.ts           Shared types + the client<->server message protocol
  deck.ts            Deck construction (normal + tunable wild mode), shuffle
  rules.ts           The single "can this card be played" rule (client + server)
  gameEngine.ts       Authoritative game state machine (turns, draws, scoring)
  useUnoRoom.ts       Client hook: connects, sends actions, receives state/hand
  sound.ts            Synthesized sound effects via Web Audio (no audio files)
party/
  server.ts           PartyKit server — wraps gameEngine.ts per room
partykit.json         PartyKit project config
```

Game rules live in one place (`lib/gameEngine.ts`) and the server is a thin
adapter, so the logic is easy to unit test or tweak independently of the
transport.

## Features implemented

- Room-code join flow, no login, name only
- Host lobby controls: deck mode (Normal / Wild with tunable intensity),
  win condition (Classic first-to-zero / Score race to a target), starting
  hand size
- Standard draw rules: draw pile, forced draw on +2 / Wild +4, draw-if-no-
  playable-card with optional immediate play of the drawn card, reshuffle
  from discard when the pile empties
- UNO callout + catch-someone-out penalty
- Turn direction indicator that flips on Reverse (acts as Skip in 2p)
- Visible draw pile "pack" with remaining count
- Live activity feed ("Alice's turn", "Bob drew a card", "Charlie was
  skipped", reshuffles, wins)
- Optimistic-feeling UI: instant card-throw animation + synthesized sound
  effects (throw / wild / draw / turn / uno / win) on both the actor's and
  everyone else's screen
- Fully responsive black-card UI (mobile portrait/landscape + desktop)

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

This runs Next.js and `partykit dev` together (`concurrently`). Open
`http://localhost:3000` in a couple of browser tabs to test multiplayer
locally.

## Deploying

**1. Deploy the PartyKit server** (from the project root):

```bash
npx partykit deploy
```

This prints a URL like `uno-web-app.<your-partykit-username>.partykit.dev`.
Copy the host (no `https://`).

**2. Deploy the frontend to Vercel:**

- Push this repo to GitHub and import it in Vercel, or run `npx vercel`.
- In Vercel's Project Settings → Environment Variables, add:
  - `NEXT_PUBLIC_PARTYKIT_HOST` = the host from step 1
- Deploy. That's it — no server config, no custom Vercel functions needed.

Redeploy the PartyKit server any time `party/server.ts` or `lib/` game-logic
files change; redeploy Vercel any time the UI changes.

## v2 — bug fixes + visual overhaul

A first pass had a real bug and a flat UI. Fixed both:

**Correctness fixes**
- **Stuck draw bug**: the "already drew this turn" flag was stored per-player
  and only cleared when *that player* played a card — so after a
  draw-then-pass turn, it stayed stuck `true` forever and silently blocked
  their next draw. It's now a single engine-level flag tied to whoever's
  turn it currently is, cleared every time the turn advances.
- **Turn order fragility**: turn order was an index into a *filtered* list of
  connected players, which reshuffles size (and therefore meaning) whenever
  someone disconnects/reconnects. Turn order is now an index into a fixed
  seat list decided once per match; stepping just skips disconnected seats
  without corrupting the mapping.
- **"Could still play after a wild"**: this was a client-side race — the UI
  didn't lock until the server's round-trip confirmed the turn had passed,
  so a fast second tap could fire before that arrived. The client now
  predicts the outcome of a play the instant you tap (see below), so the
  turn visibly passes with zero round-trip delay.
- Added a self-catch guard, safer reshuffle-from-discard, and a turn timer /
  AFK auto-play so a stalled or disconnected player can't freeze the table.

**True optimistic UI** (`lib/optimistic.ts`): playing a card now predicts the
next turn/direction/discard/pile locally and applies it immediately; the
server's next broadcast silently confirms or corrects it. This is what the
brief asked for under "optimistic UI updates" and is also what fixes the
double-play race above.

**Visual overhaul**
- Real 3D cards: `perspective` + `preserve-3d` + `translateZ` for hover lift
  and a card-throw that arcs in with actual depth, not just a 2D slide.
- A "table pit" arena backdrop, a spinning conic-gradient direction dial,
  glass-panel player plaques with mini card-back stacks, tactile
  press-down buttons (`.btn-tactile`) site-wide.
- Redesigned landing page with a pointer-parallax 3D card fan hero.
- A Settings menu with a **Reduced motion** mode for low-end/laggy devices
  — flips a `data-motion="reduced"` attribute that globally swaps every 3D
  transform/animation for a cheap fade, no per-component special-casing
  needed. Auto-detects `prefers-reduced-motion` on first load too.
- A visible turn-timer countdown ring/bar when the host enables one.



- Room state lives in the PartyKit room's memory for the session. That's
  fine for a hackathon match; for durability across long idle periods you'd
  persist `RoomState` to `room.storage` on change and rehydrate in the
  constructor — the engine is already a plain serializable-ish object, so
  that's a small follow-up, not a rewrite.
- Sound effects are synthesized in-browser (Web Audio oscillators) instead
  of shipped audio files, so there's nothing to license or host — swap in
  real `.mp3`/`.wav` files under `public/sfx/` and update `lib/sound.ts` if
  you'd rather have sampled sound.
- +2 / Wild +4 resolve immediately (classic rules) rather than stacking
  chains — the brief asked for standard draw rules, and stacking is a
  common house-rule variant you can add in `gameEngine.ts` if your group
  plays that way.
