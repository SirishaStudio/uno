import { buildDeck, cardPoints, shuffle } from "./deck";
import { canPlayCard } from "./rules";
import {
  ActivityEvent,
  Card,
  CardColor,
  HostSettings,
  Player,
  PublicGameState,
  RoomPhase,
} from "./types";

export const DEFAULT_SETTINGS: HostSettings = {
  gameMode: "normal",
  wildIntensity: 1,
  winCondition: "classic",
  targetScore: 600,
  startingHandSize: 7,
  turnTimerSeconds: 0,
};

interface PlayerInternal extends Player {
  hand: Card[];
}

export interface RoomState {
  roomCode: string;
  phase: RoomPhase;
  settings: HostSettings;
  hostId: string | null;
  order: string[]; // stable seat order for the whole match - never shrinks
  players: Map<string, PlayerInternal>;
  currentIndex: number; // index into `order`
  direction: 1 | -1;
  drawPile: Card[];
  discardPile: Card[];
  currentColor: CardColor | null;
  activity: ActivityEvent[];
  lastRoundWinnerId: string | null;
  lastRoundPoints: number;
  matchWinnerId: string | null;
  dealerIndex: number;
  hasDrawnThisTurn: boolean; // belongs to whoever's turn it currently is
}

let evCounter = 0;
function log(state: RoomState, text: string) {
  evCounter += 1;
  state.activity.unshift({ id: `e${evCounter}`, text, at: Date.now() });
  state.activity = state.activity.slice(0, 40);
}

export function createRoom(roomCode: string): RoomState {
  return {
    roomCode,
    phase: "lobby",
    settings: { ...DEFAULT_SETTINGS },
    hostId: null,
    order: [],
    players: new Map(),
    currentIndex: 0,
    direction: 1,
    drawPile: [],
    discardPile: [],
    currentColor: null,
    activity: [],
    lastRoundWinnerId: null,
    lastRoundPoints: 0,
    matchWinnerId: null,
    dealerIndex: 0,
    hasDrawnThisTurn: false,
  };
}

export function addPlayer(state: RoomState, id: string, name: string) {
  const existing = state.players.get(id);
  if (existing) {
    existing.connected = true;
    existing.name = name || existing.name;
    return;
  }
  const isHost = state.order.length === 0;
  state.players.set(id, {
    id,
    name: name || "Player",
    connected: true,
    isHost,
    handCount: 0,
    score: 0,
    saidUno: true,
    hand: [],
  });
  state.order.push(id);
  if (isHost) state.hostId = id;
  log(state, `${name || "A player"} joined the room`);
}

export function markDisconnected(state: RoomState, id: string) {
  const p = state.players.get(id);
  if (!p) return;
  p.connected = false;
  log(state, `${p.name} disconnected`);
  if (state.hostId === id) {
    const nextHost = state.order.find((pid) => pid !== id && state.players.get(pid)?.connected);
    if (nextHost) {
      state.hostId = nextHost;
      const np = state.players.get(nextHost);
      if (np) np.isHost = true;
    }
  }
}

export function updateSettings(state: RoomState, requesterId: string, patch: Partial<HostSettings>) {
  if (state.hostId !== requesterId) throw new Error("Only the host can change settings");
  if (state.phase !== "lobby") throw new Error("Settings can only change before the game starts");
  state.settings = { ...state.settings, ...patch };
}

function connectedCount(state: RoomState): number {
  let n = 0;
  for (const id of state.order) if (state.players.get(id)?.connected) n++;
  return n;
}

function isConnected(state: RoomState, id: string): boolean {
  return state.players.get(id)?.connected ?? false;
}

// --- Turn order -------------------------------------------------------
// `order` is a fixed seat list that never shrinks (players keep their seat
// even if they disconnect, so a refresh doesn't scramble turn order).
// Stepping walks that fixed list and simply skips disconnected seats.

function currentPlayerId(state: RoomState): string | null {
  if (state.order.length === 0) return null;
  return state.order[state.currentIndex % state.order.length];
}

/** Moves the turn cursor forward by exactly one *connected* seat. */
function stepOnce(state: RoomState) {
  const n = state.order.length;
  if (n === 0) return;
  let guard = 0;
  do {
    state.currentIndex = (((state.currentIndex + state.direction) % n) + n) % n;
    guard++;
  } while (!isConnected(state, state.order[state.currentIndex]) && guard <= n);
  state.hasDrawnThisTurn = false;
}

function advance(state: RoomState, steps: number) {
  for (let i = 0; i < steps; i++) stepOnce(state);
}

/** Looks ahead N connected seats without mutating state. */
function peekPlayerId(state: RoomState, steps: number, direction: 1 | -1 = state.direction): string | null {
  const n = state.order.length;
  if (n === 0) return null;
  let idx = state.currentIndex;
  let landed = 0;
  let guard = 0;
  while (landed < steps && guard <= n * 4) {
    idx = ((idx + direction) % n + n) % n;
    guard++;
    if (isConnected(state, state.order[idx])) landed++;
  }
  return state.order[idx];
}

function reshuffleIfNeeded(state: RoomState, need: number) {
  while (state.drawPile.length < need) {
    if (state.discardPile.length <= 1) break; // nothing left to reshuffle
    const top = state.discardPile[state.discardPile.length - 1];
    const rest = state.discardPile.slice(0, -1);
    state.discardPile = [top];
    state.drawPile = state.drawPile.concat(shuffle(rest));
    log(state, "Deck reshuffled from the discard pile");
  }
}

function drawCards(state: RoomState, playerId: string, count: number): Card[] {
  reshuffleIfNeeded(state, count);
  const p = state.players.get(playerId);
  if (!p) return [];
  const drawn = state.drawPile.splice(0, Math.min(count, state.drawPile.length));
  p.hand.push(...drawn);
  p.handCount = p.hand.length;
  if (p.handCount > 1) p.saidUno = true; // no longer vulnerable to a catch
  return drawn;
}

function randomColor(): CardColor {
  const c: CardColor[] = ["red", "yellow", "green", "blue"];
  return c[Math.floor(Math.random() * c.length)];
}

function describeCard(c: Card): string {
  if (c.kind === "number") return String(c.value);
  if (c.kind === "wild") return "Wild";
  if (c.kind === "wild4") return "Wild +4";
  if (c.kind === "draw2") return "+2";
  return c.kind[0].toUpperCase() + c.kind.slice(1);
}

function dealRound(state: RoomState) {
  state.drawPile = buildDeck(state.settings.gameMode, state.settings.wildIntensity);
  state.discardPile = [];
  state.currentColor = null;
  state.direction = 1;
  state.hasDrawnThisTurn = false;

  for (const id of state.order) {
    const p = state.players.get(id)!;
    p.hand = [];
    p.saidUno = true;
  }

  for (const id of state.order) {
    if (isConnected(state, id)) drawCards(state, id, state.settings.startingHandSize);
  }

  // Flip the starting card; a Wild +4 opener goes back into the deck.
  let starter: Card | undefined;
  const buffer: Card[] = [];
  while (state.drawPile.length > 0) {
    const c = state.drawPile.shift()!;
    if (c.kind === "wild4") {
      buffer.push(c);
      continue;
    }
    starter = c;
    break;
  }
  state.drawPile.push(...shuffle(buffer));
  if (!starter) starter = { id: "fallback", color: "red", kind: "number", value: 0 };
  state.discardPile.push(starter);
  state.currentColor = starter.color === "wild" ? randomColor() : starter.color;

  state.currentIndex = state.dealerIndex % state.order.length;
  if (!isConnected(state, state.order[state.currentIndex])) {
    stepOnce(state); // dealer's seat is empty right now - nudge onto a live seat
  }

  if (starter.kind === "reverse") {
    state.direction = -1;
    log(state, `Round started - Reverse - direction flipped`);
  } else if (starter.kind === "skip") {
    log(state, `Round started - the first seat is skipped`);
    advance(state, 1);
  } else if (starter.kind === "draw2") {
    const hitId = peekPlayerId(state, 1);
    if (hitId) {
      drawCards(state, hitId, 2);
      log(state, `Round started - ${state.players.get(hitId)?.name} draws 2 from the opening card`);
    }
    advance(state, 1);
  } else {
    log(state, `Round started - ${starter.color !== "wild" ? starter.color : state.currentColor} ${describeCard(starter)}`);
  }
}

export function startGame(state: RoomState, requesterId: string) {
  if (state.hostId !== requesterId) throw new Error("Only the host can start the game");
  if (state.phase !== "lobby" && state.phase !== "matchEnd") throw new Error("Game already in progress");
  if (connectedCount(state) < 2) throw new Error("Need at least 2 players to start");

  for (const id of state.order) {
    const p = state.players.get(id)!;
    p.score = 0;
  }
  state.dealerIndex = 0;
  state.matchWinnerId = null;
  state.lastRoundWinnerId = null;
  state.lastRoundPoints = 0;
  state.phase = "playing";
  dealRound(state);
}

const canPlay = canPlayCard;

export function playCard(
  state: RoomState,
  playerId: string,
  cardId: string,
  chosenColor: CardColor | undefined
) {
  if (state.phase !== "playing") throw new Error("No active round");
  if (currentPlayerId(state) !== playerId) throw new Error("Not your turn");

  const player = state.players.get(playerId);
  if (!player) throw new Error("Unknown player");
  const idx = player.hand.findIndex((c) => c.id === cardId);
  if (idx === -1) throw new Error("Card not in hand");
  const card = player.hand[idx];
  const top = state.discardPile[state.discardPile.length - 1];

  if (!state.currentColor || !top || !canPlay(card, state.currentColor, top)) {
    throw new Error("That card can't be played right now");
  }
  if ((card.kind === "wild" || card.kind === "wild4") && !chosenColor) {
    throw new Error("Choose a color for the wild card");
  }

  player.hand.splice(idx, 1);
  player.handCount = player.hand.length;
  state.discardPile.push(card);
  state.currentColor = card.color === "wild" ? chosenColor! : card.color;

  if (card.kind === "reverse") {
    state.direction = state.direction === 1 ? -1 : 1;
  }

  const twoPlayer = connectedCount(state) === 2;
  const nextId = peekPlayerId(state, 1);

  switch (card.kind) {
    case "number":
      log(state, `${player.name} played ${state.currentColor} ${card.value}`);
      advance(state, 1);
      break;
    case "skip":
      log(state, `${player.name} played Skip${nextId ? ` - ${state.players.get(nextId)?.name} is skipped` : ""}`);
      advance(state, 2);
      break;
    case "reverse":
      if (twoPlayer) {
        log(state, `${player.name} played Reverse - acts as Skip`);
        advance(state, 2);
      } else {
        log(state, `${player.name} played Reverse - direction flipped`);
        advance(state, 1);
      }
      break;
    case "draw2": {
      if (nextId) {
        drawCards(state, nextId, 2);
        log(state, `${player.name} played +2 - ${state.players.get(nextId)?.name} draws 2 and is skipped`);
      }
      advance(state, 2);
      break;
    }
    case "wild":
      log(state, `${player.name} played Wild - color is now ${chosenColor}`);
      advance(state, 1);
      break;
    case "wild4": {
      if (nextId) {
        drawCards(state, nextId, 4);
        log(state, `${player.name} played Wild +4 - ${state.players.get(nextId)?.name} draws 4 and is skipped, color is now ${chosenColor}`);
      }
      advance(state, 2);
      break;
    }
  }

  if (player.handCount === 1) {
    player.saidUno = false; // must call UNO now or risk being caught
  }

  if (player.handCount === 0) {
    finishRound(state, playerId);
  }
}

export function drawCard(state: RoomState, playerId: string) {
  if (state.phase !== "playing") throw new Error("No active round");
  if (currentPlayerId(state) !== playerId) throw new Error("Not your turn");
  if (state.hasDrawnThisTurn) throw new Error("Already drew this turn");
  const player = state.players.get(playerId);
  if (!player) throw new Error("Unknown player");

  const top = state.discardPile[state.discardPile.length - 1];
  const hasPlayable = state.currentColor && top && player.hand.some((c) => canPlay(c, state.currentColor!, top));
  if (hasPlayable) throw new Error("You have a playable card");

  drawCards(state, playerId, 1);
  state.hasDrawnThisTurn = true;
  log(state, `${player.name} drew a card`);

  const drawnCard = player.hand[player.hand.length - 1];
  const drawnPlayable = state.currentColor && top && drawnCard && canPlay(drawnCard, state.currentColor, top);

  if (!drawnPlayable) {
    advance(state, 1);
    log(state, `${player.name}'s turn passes`);
  }
}

export function passTurn(state: RoomState, playerId: string) {
  if (state.phase !== "playing") throw new Error("No active round");
  if (currentPlayerId(state) !== playerId) throw new Error("Not your turn");
  if (!state.hasDrawnThisTurn) throw new Error("Draw first before passing");
  const player = state.players.get(playerId);
  advance(state, 1);
  log(state, `${player?.name ?? "Player"} passed`);
}

export function sayUno(state: RoomState, playerId: string) {
  const p = state.players.get(playerId);
  if (!p) return;
  p.saidUno = true;
  log(state, `${p.name} called UNO!`);
}

export function catchUno(state: RoomState, accuserId: string, targetId: string) {
  if (accuserId === targetId) throw new Error("You can't catch yourself");
  const accuser = state.players.get(accuserId);
  const target = state.players.get(targetId);
  if (!accuser || !target) throw new Error("Unknown player");
  if (target.handCount !== 1 || target.saidUno) {
    throw new Error(`${target.name} is safe`);
  }
  drawCards(state, targetId, 2);
  target.saidUno = true;
  log(state, `${accuser.name} caught ${target.name} without calling UNO - +2 penalty`);
}

/** Picks a sensible action for the current player - used for turn timers /
 * covering an AFK player so the table never stalls indefinitely. */
export function autoAct(state: RoomState, playerId: string) {
  if (state.phase !== "playing" || currentPlayerId(state) !== playerId) return;
  const player = state.players.get(playerId);
  const top = state.discardPile[state.discardPile.length - 1];
  if (!player || !state.currentColor || !top) return;

  const playable = player.hand.find((c) => canPlay(c, state.currentColor!, top));
  if (playable) {
    let color: CardColor | undefined;
    if (playable.color === "wild") {
      const counts: Partial<Record<CardColor, number>> = {};
      for (const c of player.hand) if (c.color !== "wild") counts[c.color] = (counts[c.color] ?? 0) + 1;
      const best = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
      color = (best?.[0] as CardColor) ?? randomColor();
    }
    playCard(state, playerId, playable.id, color);
  } else if (!state.hasDrawnThisTurn) {
    drawCard(state, playerId);
  } else {
    passTurn(state, playerId);
  }
}

function finishRound(state: RoomState, winnerId: string) {
  const winner = state.players.get(winnerId)!;

  if (state.settings.winCondition === "classic") {
    state.matchWinnerId = winnerId;
    state.phase = "matchEnd";
    log(state, `${winner.name} wins the game with an empty hand!`);
    return;
  }

  let points = 0;
  for (const id of state.order) {
    if (id === winnerId) continue;
    const p = state.players.get(id)!;
    points += p.hand.reduce((sum, c) => sum + cardPoints(c), 0);
  }
  winner.score += points;
  state.lastRoundWinnerId = winnerId;
  state.lastRoundPoints = points;
  log(state, `${winner.name} wins the round (+${points} points, total ${winner.score})`);

  if (winner.score >= state.settings.targetScore) {
    state.matchWinnerId = winnerId;
    state.phase = "matchEnd";
    log(state, `${winner.name} wins the match with ${winner.score} points!`);
  } else {
    state.phase = "roundEnd";
  }
}

export function nextRound(state: RoomState, requesterId: string) {
  if (state.hostId !== requesterId) throw new Error("Only the host can start the next round");
  if (state.phase !== "roundEnd") throw new Error("Round is not over yet");
  state.dealerIndex = (state.dealerIndex + 1) % Math.max(1, state.order.length);
  state.phase = "playing";
  dealRound(state);
}

export function getHand(state: RoomState, playerId: string): Card[] {
  return state.players.get(playerId)?.hand ?? [];
}

export function toPublicState(state: RoomState, turnDeadline: number | null = null): PublicGameState {
  const top = state.discardPile.length ? state.discardPile[state.discardPile.length - 1] : null;
  return {
    phase: state.phase,
    roomCode: state.roomCode,
    settings: state.settings,
    players: state.order
      .map((id) => state.players.get(id))
      .filter((p): p is PlayerInternal => !!p)
      .map((p) => ({
        id: p.id,
        name: p.name,
        connected: p.connected,
        isHost: p.isHost,
        handCount: p.handCount,
        score: p.score,
        saidUno: p.saidUno,
      })),
    hostId: state.hostId,
    currentPlayerId: state.phase === "playing" ? currentPlayerId(state) : null,
    direction: state.direction,
    discardTop: top,
    currentColor: state.currentColor,
    drawPileCount: state.drawPile.length,
    activity: state.activity,
    pendingDrawCount: 0,
    hasDrawnThisTurn: state.hasDrawnThisTurn,
    turnDeadline,
    lastRoundWinnerId: state.lastRoundWinnerId,
    lastRoundPoints: state.lastRoundPoints,
    matchWinnerId: state.matchWinnerId,
    vulnerableToUnoCallout: state.order.filter((id) => {
      const p = state.players.get(id);
      return p && p.handCount === 1 && !p.saidUno;
    }),
  };
}
