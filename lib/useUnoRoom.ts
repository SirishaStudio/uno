"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { nanoid } from "nanoid";
import { Card, ClientMessage, PublicGameState, ServerMessage } from "./types";
import { playSound } from "./sound";

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || "localhost:1999";

function getPersistentPlayerId(roomCode: string): string {
  if (typeof window === "undefined") return nanoid(10);
  const key = `uno:pid:${roomCode}`;
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = nanoid(10);
    window.localStorage.setItem(key, id);
  }
  return id;
}

export function useUnoRoom(roomCode: string, playerName: string) {
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<PublicGameState | null>(null);
  const [hand, setHand] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastThrown, setLastThrown] = useState<{ playerId: string; card: Card } | null>(null);
  const socketRef = useRef<PartySocket | null>(null);
  const playerIdRef = useRef<string>("");
  const prevCurrentPlayer = useRef<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    const pid = getPersistentPlayerId(roomCode);
    playerIdRef.current = pid;

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomCode.toLowerCase(),
      id: pid,
    });
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnected(true);
      socket.send(JSON.stringify({ type: "join", name: playerName } satisfies ClientMessage));
    });
    socket.addEventListener("close", () => setConnected(false));
    socket.addEventListener("message", (evt) => {
      const msg: ServerMessage = JSON.parse(evt.data);
      if (msg.type === "state") {
        if (
          msg.state.currentPlayerId &&
          msg.state.currentPlayerId === playerIdRef.current &&
          msg.state.currentPlayerId !== prevCurrentPlayer.current
        ) {
          playSound("turn");
        }
        prevCurrentPlayer.current = msg.state.currentPlayerId;
        setState(msg.state);
      } else if (msg.type === "hand") {
        setHand(msg.cards);
      } else if (msg.type === "cardThrown") {
        setLastThrown({ playerId: msg.playerId, card: msg.card });
        playSound(msg.card.color === "wild" ? "wild" : "throw");
      } else if (msg.type === "youDrew") {
        playSound("draw");
      } else if (msg.type === "error") {
        setError(msg.message);
        setTimeout(() => setError(null), 3500);
      }
    });

    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, playerName]);

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(msg));
  }, []);

  return {
    connected,
    state,
    hand,
    error,
    lastThrown,
    playerId: playerIdRef.current,
    send,
  };
}
