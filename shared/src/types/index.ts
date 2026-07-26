export type CardColor = 'red' | 'yellow' | 'green' | 'blue' | 'wild';

export type CardValue =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'skip'
  | 'reverse'
  | 'draw-two'
  | 'wild'
  | 'wild-draw-four';

export interface UnoCard {
  id: string;
  color: CardColor;
  value: CardValue;
}

export type PlayerId = string;
export type RoomCode = string;

export interface PlayerProfileStats {
  displayName: string;
  uid: string;
  photoURL: string | null;
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
  totalScore: number;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionStatus = 'connected' | 'disconnected';

export interface RoomPlayer {
  id: PlayerId;
  displayName: string;
  photoURL: string | null;
  isReady: boolean;
  isHost: boolean;
  connectionStatus: ConnectionStatus;
}

export type RoomPhase = 'lobby' | 'playing' | 'finished';

export interface RoomStatePayload {
  code: RoomCode;
  hostId: PlayerId;
  phase: RoomPhase;
  players: RoomPlayer[];
  maxPlayers: number;
  inviteLink: string;
}

export interface RoomPlayerPayload {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

export interface RoomCreatePayload extends RoomPlayerPayload {}

export interface RoomJoinPayload extends RoomPlayerPayload {
  code: string;
}

export interface RoomRejoinPayload extends RoomPlayerPayload {
  code: string;
}

export interface RoomReadyPayload {
  ready: boolean;
}

export interface RoomKickPayload {
  targetUid: string;
}

export type RoomNotificationType =
  | 'player_joined'
  | 'player_left'
  | 'player_disconnected'
  | 'player_reconnected'
  | 'player_kicked'
  | 'host_transferred';

export interface RoomNotificationPayload {
  type: RoomNotificationType;
  message: string;
  playerId?: PlayerId;
  roomCode?: RoomCode;
}

export interface RoomErrorPayload {
  code: string;
  message: string;
}

/** @deprecated Use RoomStatePayload */
export interface RoomSummary {
  code: RoomCode;
  hostId: PlayerId;
  phase: RoomPhase;
  players: RoomPlayer[];
  maxPlayers: number;
}
