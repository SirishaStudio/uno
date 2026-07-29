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
  hasDrawnThisTurn: boolean;
}

export interface RoomState {
  roomCode: string;
  phase: RoomPhase;
  settings: HostSettings;
  hostId: string | null;
  order: string[]; // seat order, stable across a match
  players: Map<string, PlayerInternal>;
  currentIndex: number;
  direction: 1 | -1;
  drawPile: Card[];
  discardPile: Card[];
  currentColor: CardColor | null;
  activity: ActivityEvent[];
  lastRoundWinnerId: string | null;
  lastRoundPoints: number;
  matchWinnerId: string | null;
  dealerIndex: number;
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
    hasDrawnThisTurn: false,
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

function activePlayers(state: RoomState): string[] {
  return state.order.filter((id) => state.players.get(id)?.connected);
}

function reshuffleIfNeeded(state: RoomState, need: number) {
  while (state.drawPile.length < need) {
    if (state.discardPile.length <= 1) {
      // Not enough cards anywhere; bail gracefully.
      break;
    }
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
  if (p.handCount > 1) p.saidUno = true; // no longer vulnerable
  return drawn;
}

function dealRound(state: RoomState) {
  state.drawPile = buildDeck(state.settings.gameMode, state.settings.wildIntensity);
  state.discardPile = [];
  state.currentColor = null;
  state.direction = 1;

  for (const id of activePlayers(state)) {
    const p = state.players.get(id)!;
    p.hand = [];
    p.hasDrawnThisTurn = false;
    p.saidUno = true;
  }

  for (const id of activePlayers(state)) {
    drawCards(state, id, state.settings.startingHandSize);
  }

  // Flip the starting card, skipping wild-draw-four (goes back into the deck).
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

  const order = activePlayers(state);
  state.currentIndex = state.dealerIndex % order.length;

  if (starter.kind === "reverse") {
    state.direction = -1;
    if (order.length > 2) advance(state, 1);
  } else if (starter.kind === "skip") {
    advance(state, 1);
  } else if (starter.kind === "draw2") {
    const skippedId = order[(state.currentIndex + state.direction + order.length) % order.length];
    drawCards(state, skippedId, 2);
    log(state, `${state.players.get(skippedId)?.name} draws 2 from the opening card`);
    advance(state, 1);
  }

  log(state, `Round started - ${starter.color !== "wild" ? starter.color : state.currentColor} ${describeCard(starter)}`);
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

export function startGame(state: RoomState, requesterId: string) {
  if (state.hostId !== requesterId) throw new Error("Only the host can start the game");
  if (state.phase !== "lobby" && state.phase !== "matchEnd") throw new Error("Game already in progress");
  const players = activePlayers(state);
  if (players.length < 2) throw new Error("Need at least 2 players to start");

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

function currentPlayerId(state: RoomState): string | null {
  const order = activePlayers(state);
  if (order.length === 0) return null;
  return order[state.currentIndex % order.length];
}

function advance(state: RoomState, steps: number) {
  const order = activePlayers(state);
  if (order.length === 0) return;
  state.currentIndex = (((state.currentIndex + state.direction * steps) % order.length) + order.length) % order.length;
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

  if (!state.currentColor || !canPlay(card, state.currentColor, top)) {
    throw new Error("That card can't be played right now");
  }
  if ((card.kind === "wild" || card.kind === "wild4") && !chosenColor) {
    throw new Error("Choose a color for the wild card");
  }

  player.hand.splice(idx, 1);
  player.handCount = player.hand.length;
  player.hasDrawnThisTurn = false;
  state.discardPile.push(card);

  const order = activePlayers(state);
  const nextIdx = (state.currentIndex + state.direction + order.length) % order.length;
  const nextPlayerId = order[nextIdx];

  state.currentColor = card.color === "wild" ? chosenColor! : card.color;

  switch (card.kind) {
    case "number":
      log(state, `${player.name} played ${state.currentColor} ${card.value}`);
      advance(state, 1);
      break;
    case "skip":
      log(state, `${player.name} played Skip - ${state.players.get(nextPlayerId)?.name} is skipped`);
      advance(state, 2);
      break;
    case "reverse":
      state.direction = state.direction === 1 ? -1 : 1;
      if (order.length === 2) {
        log(state, `${player.name} played Reverse - acts as Skip`);
        advance(state, 2);
      } else {
        log(state, `${player.name} played Reverse - direction flipped`);
        advance(state, 1);
      }
      break;
    case "draw2": {
      log(state, `${player.name} played +2 - ${state.players.get(nextPlayerId)?.name} draws 2 and is skipped`);
      drawCards(state, nextPlayerId, 2);
      advance(state, 2);
      break;
    }
    case "wild":
      log(state, `${player.name} played Wild - color is now ${chosenColor}`);
      advance(state, 1);
      break;
    case "wild4": {
      log(state, `${player.name} played Wild +4 - ${state.players.get(nextPlayerId)?.name} draws 4 and is skipped, color is now ${chosenColor}`);
      drawCards(state, nextPlayerId, 4);
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
  const player = state.players.get(playerId);
  if (!player) throw new Error("Unknown player");
  if (player.hasDrawnThisTurn) throw new Error("Already drew this turn");

  const top = state.discardPile[state.discardPile.length - 1];
  const hasPlayable = state.currentColor && player.hand.some((c) => canPlay(c, state.currentColor!, top));
  if (hasPlayable) throw new Error("You have a playable card");

  drawCards(state, playerId, 1);
  player.hasDrawnThisTurn = true;
  log(state, `${player.name} drew a card`);

  const drawnPlayable =
    state.currentColor &&
    player.hand.length > 0 &&
    canPlay(player.hand[player.hand.length - 1], state.currentColor, top);

  if (!drawnPlayable) {
    advance(state, 1);
    log(state, `${player.name}'s turn passes`);
  }
}

export function passTurn(state: RoomState, playerId: string) {
  if (state.phase !== "playing") throw new Error("No active round");
  if (currentPlayerId(state) !== playerId) throw new Error("Not your turn");
  const player = state.players.get(playerId);
  if (!player || !player.hasDrawnThisTurn) throw new Error("Draw first before passing");
  advance(state, 1);
  log(state, `${player.name} passed`);
}

export function sayUno(state: RoomState, playerId: string) {
  const p = state.players.get(playerId);
  if (!p) return;
  p.saidUno = true;
  log(state, `${p.name} called UNO!`);
}

export function catchUno(state: RoomState, accuserId: string, targetId: string) {
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

function finishRound(state: RoomState, winnerId: string) {
  const winner = state.players.get(winnerId)!;

  if (state.settings.winCondition === "classic") {
    state.matchWinnerId = winnerId;
    state.phase = "matchEnd";
    log(state, `${winner.name} wins the game with an empty hand!`);
    return;
  }

  let points = 0;
  for (const id of activePlayers(state)) {
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
  state.dealerIndex = (state.dealerIndex + 1) % Math.max(1, activePlayers(state).length);
  state.phase = "playing";
  dealRound(state);
}

export function getHand(state: RoomState, playerId: string): Card[] {
  return state.players.get(playerId)?.hand ?? [];
}

export function toPublicState(state: RoomState): PublicGameState {
  const order = activePlayers(state);
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
    currentPlayerId: state.phase === "playing" ? order[state.currentIndex % Math.max(1, order.length)] ?? null : null,
    direction: state.direction,
    discardTop: top,
    currentColor: state.currentColor,
    drawPileCount: state.drawPile.length,
    activity: state.activity,
    pendingDrawCount: 0,
    lastRoundWinnerId: state.lastRoundWinnerId,
    lastRoundPoints: state.lastRoundPoints,
    matchWinnerId: state.matchWinnerId,
    vulnerableToUnoCallout: state.order.filter((id) => {
      const p = state.players.get(id);
      return p && p.handCount === 1 && !p.saidUno;
    }),
  };
}
