import type * as Party from "partykit/server";
import {
  RoomState,
  addPlayer,
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

  constructor(readonly room: Party.Room) {
    this.state = createRoom(room.id);
  }

  send(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  broadcastState() {
    const publicState = toPublicState(this.state);
    const msg: ServerMessage = { type: "state", state: publicState };
    this.room.broadcast(JSON.stringify(msg));
    // Private hands go out individually.
    for (const conn of this.room.getConnections()) {
      const hand = getHand(this.state, conn.id);
      this.send(conn, { type: "hand", cards: hand });
    }
  }

  onConnect(conn: Party.Connection) {
    // A player only becomes "active" once they send a `join` message with
    // their name; until then we still register a placeholder so refreshes
    // that lose the join race don't crash.
    this.broadcastState();
  }

  onClose(conn: Party.Connection) {
    if (this.state.players.has(conn.id)) {
      markDisconnected(this.state, conn.id);
      this.broadcastState();
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
  }
}
