import type * as Party from "partykit/server";
import {
  RoomState,
  addPlayer,
  autoAct,
  catchUno,
  createRoom,
  drawCard,
  getHand,
  markDisconnected,
  nextRound,
  passTurn,
  playCard,
  sayUno,
  startGame,
  toPublicState,
  updateSettings,
} from "../lib/gameEngine";
import { ClientMessage, ServerMessage } from "../lib/types";

export default class UnoServer implements Party.Server {
  state: RoomState;
  turnDeadline: number | null = null;
  timer: ReturnType<typeof setTimeout> | null = null;

  constructor(readonly room: Party.Room) {
    this.state = createRoom(room.id);
  }

  send(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  broadcastState() {
    const publicState = toPublicState(this.state, this.turnDeadline);
    const msg: ServerMessage = { type: "state", state: publicState };
    this.room.broadcast(JSON.stringify(msg));
    for (const conn of this.room.getConnections()) {
      const hand = getHand(this.state, conn.id);
      this.send(conn, { type: "hand", cards: hand });
    }
  }

  /** Clears and reschedules the AFK/turn-timer for whoever's turn it is. */
  scheduleTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.turnDeadline = null;

    if (this.state.phase !== "playing") return;
    const secs = this.state.settings.turnTimerSeconds;
    if (!secs) return;

    this.turnDeadline = Date.now() + secs * 1000;
    const currentId = toPublicState(this.state).currentPlayerId;
    this.timer = setTimeout(() => {
      if (!currentId) return;
      try {
        autoAct(this.state, currentId);
      } catch {
        // best-effort; if it fails the game just waits for a human action
      }
      this.turnDeadline = null;
      this.broadcastState();
      this.scheduleTimer();
    }, secs * 1000);
  }

  onConnect(conn: Party.Connection) {
    this.broadcastState();
  }

  onClose(conn: Party.Connection) {
    if (this.state.players.has(conn.id)) {
      markDisconnected(this.state, conn.id);
      this.broadcastState();
      this.scheduleTimer();
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }

    try {
      switch (parsed.type) {
        case "join": {
          addPlayer(this.state, sender.id, parsed.name.slice(0, 20));
          break;
        }
        case "hostUpdateSettings": {
          updateSettings(this.state, sender.id, parsed.settings);
          break;
        }
        case "startGame": {
          startGame(this.state, sender.id);
          break;
        }
        case "playCard": {
          const player = this.state.players.get(sender.id);
          const card = player?.hand.find((c) => c.id === parsed.cardId);
          playCard(this.state, sender.id, parsed.cardId, parsed.chosenColor);
          if (card) {
            const thrown: ServerMessage = { type: "cardThrown", playerId: sender.id, card };
            this.room.broadcast(JSON.stringify(thrown));
          }
          break;
        }
        case "drawCard": {
          drawCard(this.state, sender.id);
          break;
        }
        case "passTurn": {
          passTurn(this.state, sender.id);
          break;
        }
        case "sayUno": {
          sayUno(this.state, sender.id);
          break;
        }
        case "catchUno": {
          catchUno(this.state, sender.id, parsed.targetId);
          break;
        }
        case "nextRound": {
          nextRound(this.state, sender.id);
          break;
        }
        case "leave": {
          markDisconnected(this.state, sender.id);
          break;
        }
      }
    } catch (err) {
      this.send(sender, { type: "error", message: err instanceof Error ? err.message : "Unknown error" });
      return;
    }

    this.broadcastState();
    this.scheduleTimer();
  }
}
