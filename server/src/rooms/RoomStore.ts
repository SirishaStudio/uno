import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  RECONNECT_TIMEOUT_MS,
  ROOM_CODE_DIGITS,
  ROOM_CODE_PATTERN,
  ROOM_CODE_WORDS,
  type RoomPhase,
  type RoomStatePayload,
} from '@online-uno/shared';

export interface RoomPlayerInternal {
  uid: string;
  displayName: string;
  photoURL: string | null;
  isReady: boolean;
  socketId: string | null;
  connected: boolean;
  joinOrder: number;
  disconnectTimer: ReturnType<typeof setTimeout> | null;
}

export interface RoomInternal {
  code: string;
  hostId: string;
  phase: RoomPhase;
  players: Map<string, RoomPlayerInternal>;
  nextJoinOrder: number;
}

export class RoomStore {
  private readonly rooms = new Map<string, RoomInternal>();
  private readonly socketToRoom = new Map<string, string>();
  private readonly socketToUid = new Map<string, string>();

  generateCode(): string {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const word = ROOM_CODE_WORDS[Math.floor(Math.random() * ROOM_CODE_WORDS.length)];
      const digit = ROOM_CODE_DIGITS[Math.floor(Math.random() * ROOM_CODE_DIGITS.length)];
      const code = `${word}${digit}`;
      if (!this.rooms.has(code)) {
        return code;
      }
    }
    throw new Error('ROOM_CODE_EXHAUSTED');
  }

  normalizeCode(raw: string): string | null {
    const code = raw.trim().toUpperCase();
    if (!ROOM_CODE_PATTERN.test(code)) {
      return null;
    }
    return code;
  }

  getRoom(code: string): RoomInternal | undefined {
    return this.rooms.get(code);
  }

  getRoomBySocket(socketId: string): RoomInternal | undefined {
    const code = this.socketToRoom.get(socketId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  getUidForSocket(socketId: string): string | undefined {
    return this.socketToUid.get(socketId);
  }

  createRoom(
    code: string,
    host: Omit<RoomPlayerInternal, 'isReady' | 'joinOrder' | 'disconnectTimer' | 'connected'> & {
      connected: boolean;
    },
  ): RoomInternal {
    const room: RoomInternal = {
      code,
      hostId: host.uid,
      phase: 'lobby',
      players: new Map(),
      nextJoinOrder: 0,
    };
    this.rooms.set(code, room);
    this.addOrUpdatePlayer(room, {
      ...host,
      isReady: false,
      joinOrder: room.nextJoinOrder++,
      disconnectTimer: null,
    });
    return room;
  }

  addOrUpdatePlayer(room: RoomInternal, player: RoomPlayerInternal): void {
    room.players.set(player.uid, player);
    if (player.socketId) {
      this.socketToRoom.set(player.socketId, room.code);
      this.socketToUid.set(player.socketId, player.uid);
    }
  }

  unbindSocket(socketId: string): void {
    this.socketToRoom.delete(socketId);
    this.socketToUid.delete(socketId);
  }

  bindSocket(room: RoomInternal, uid: string, socketId: string): void {
    const player = room.players.get(uid);
    if (!player) return;
    if (player.socketId && player.socketId !== socketId) {
      this.socketToRoom.delete(player.socketId);
      this.socketToUid.delete(player.socketId);
    }
    player.socketId = socketId;
    player.connected = true;
    this.clearDisconnectTimer(player);
    this.socketToRoom.set(socketId, room.code);
    this.socketToUid.set(socketId, uid);
  }

  clearDisconnectTimer(player: RoomPlayerInternal): void {
    if (player.disconnectTimer) {
      clearTimeout(player.disconnectTimer);
      player.disconnectTimer = null;
    }
  }

  removePlayer(room: RoomInternal, uid: string): RoomPlayerInternal | undefined {
    const player = room.players.get(uid);
    if (!player) return undefined;
    this.clearDisconnectTimer(player);
    if (player.socketId) {
      this.socketToRoom.delete(player.socketId);
      this.socketToUid.delete(player.socketId);
    }
    room.players.delete(uid);
    return player;
  }

  deleteRoom(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;
    for (const player of room.players.values()) {
      this.clearDisconnectTimer(player);
      if (player.socketId) {
        this.socketToRoom.delete(player.socketId);
        this.socketToUid.delete(player.socketId);
      }
    }
    this.rooms.delete(code);
  }

  transferHost(room: RoomInternal): boolean {
    const connected = [...room.players.values()]
      .filter((p) => p.connected)
      .sort((a, b) => a.joinOrder - b.joinOrder);
    const next = connected[0];
    if (!next) {
      return false;
    }
    room.hostId = next.uid;
    return true;
  }

  toPayload(room: RoomInternal, inviteLink: string): RoomStatePayload {
    const players = [...room.players.values()]
      .sort((a, b) => a.joinOrder - b.joinOrder)
      .map((p) => ({
        id: p.uid,
        displayName: p.displayName,
        photoURL: p.photoURL,
        isReady: p.isReady,
        isHost: p.uid === room.hostId,
        connectionStatus: p.connected ? ('connected' as const) : ('disconnected' as const),
      }));

    return {
      code: room.code,
      hostId: room.hostId,
      phase: room.phase,
      players,
      maxPlayers: MAX_PLAYERS,
      inviteLink,
    };
  }

  canStart(room: RoomInternal): { ok: true } | { ok: false; reason: string } {
    if (room.phase !== 'lobby') {
      return { ok: false, reason: 'Game already started.' };
    }
    const connected = [...room.players.values()].filter((p) => p.connected);
    if (connected.length < MIN_PLAYERS) {
      return { ok: false, reason: `Need at least ${MIN_PLAYERS} connected players.` };
    }
    if (!connected.every((p) => p.isReady)) {
      return { ok: false, reason: 'All connected players must be ready.' };
    }
    return { ok: true };
  }

  scheduleRemoval(
    room: RoomInternal,
    uid: string,
    onRemove: () => void,
  ): void {
    const player = room.players.get(uid);
    if (!player) return;
    this.clearDisconnectTimer(player);
    player.disconnectTimer = setTimeout(() => {
      player.disconnectTimer = null;
      if (player.connected) return;
      onRemove();
    }, RECONNECT_TIMEOUT_MS);
  }
}

export const roomStore = new RoomStore();
