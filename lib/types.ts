export type CardColor = "red" | "yellow" | "green" | "blue" | "wild";

export type CardKind =
  | "number"
  | "skip"
  | "reverse"
  | "draw2"
  | "wild"
  | "wild4";

export interface Card {
  id: string;
  color: CardColor;
  kind: CardKind;
  value?: number; // 0-9, only for kind "number"
}

export type GameMode = "normal" | "wild";
export type WinCondition = "classic" | "score";

export interface HostSettings {
  gameMode: GameMode;
  wildIntensity: number; // 0-3, only used when gameMode === "wild"
  winCondition: WinCondition;
  targetScore: number; // only used when winCondition === "score"
  startingHandSize: number;
  turnTimerSeconds: number; // 0 = off
}

export interface Player {
  id: string; // connection id, stable per browser tab/session
  name: string;
  connected: boolean;
  isHost: boolean;
  handCount: number;
  score: number;
  saidUno: boolean;
}

export interface ActivityEvent {
  id: string;
  text: string;
  at: number;
}

export type RoomPhase = "lobby" | "playing" | "roundEnd" | "matchEnd";

export interface PublicGameState {
  phase: RoomPhase;
  roomCode: string;
  settings: HostSettings;
  players: Player[];
  hostId: string | null;
  currentPlayerId: string | null;
  direction: 1 | -1;
  discardTop: Card | null;
  currentColor: CardColor | null;
  drawPileCount: number;
  activity: ActivityEvent[];
  pendingDrawCount: number; // stacked forced-draw amount owed by current player
  hasDrawnThisTurn: boolean;
  turnDeadline: number | null; // ms epoch; null when no turn timer is running
  lastRoundWinnerId: string | null;
  lastRoundPoints: number;
  matchWinnerId: string | null;
  vulnerableToUnoCallout: string[]; // player ids with exactly 1 card who haven't said uno
}

// Message shapes exchanged with the PartyKit room
export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "hostUpdateSettings"; settings: Partial<HostSettings> }
  | { type: "startGame" }
  | { type: "playCard"; cardId: string; chosenColor?: CardColor }
  | { type: "drawCard" }
  | { type: "passTurn" }
  | { type: "sayUno" }
  | { type: "catchUno"; targetId: string }
  | { type: "nextRound" }
  | { type: "leave" };

export type ServerMessage =
  | { type: "state"; state: PublicGameState }
  | { type: "hand"; cards: Card[] }
  | { type: "cardThrown"; playerId: string; card: Card }
  | { type: "youDrew"; count: number }
  | { type: "error"; message: string };
