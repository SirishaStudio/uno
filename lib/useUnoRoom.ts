"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { nanoid } from "nanoid";
import { Card, CardColor, ClientMessage, HostSettings, PublicGameState, ServerMessage } from "./types";
import { playSound } from "./sound";
import { predictDrawCard, predictPlayCard } from "./optimistic";

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
  const [serverState, setServerState] = useState<PublicGameState | null>(null);
  const [serverHand, setServerHand] = useState<Card[]>([]);
  const [optimisticState, setOptimisticState] = useState<PublicGameState | null>(null);
  const [optimisticHand, setOptimisticHand] = useState<Card[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastThrown, setLastThrown] = useState<{ playerId: string; card: Card; seq: number } | null>(null);

  const socketRef = useRef<PartySocket | null>(null);
  const playerIdRef = useRef<string>("");
  const prevCurrentPlayer = useRef<string | null>(null);
  const throwSeqRef = useRef(0);

  useEffect(() => {
    if (!roomCode) return;
    const pid = getPersistentPlayerId(roomCode);
    playerIdRef.current = pid;

    const socket = new PartySocket({ host: PARTYKIT_HOST, room: roomCode.toLowerCase(), id: pid });
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
        setServerState(msg.state);
        setOptimisticState(null); // server truth always wins
      } else if (msg.type === "hand") {
        setServerHand(msg.cards);
        setOptimisticHand(null);
      } else if (msg.type === "cardThrown") {
        throwSeqRef.current += 1;
        setLastThrown({ playerId: msg.playerId, card: msg.card, seq: throwSeqRef.current });
        playSound(msg.card.color === "wild" ? "wild" : "throw");
      } else if (msg.type === "error") {
        setError(msg.message);
        setOptimisticState(null);
        setOptimisticHand(null);
        setTimeout(() => setError(null), 3500);
      }
    });

    return () => socket.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, playerName]);

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(msg));
  }, []);

  const playCard = useCallback(
    (card: Card, chosenColor?: CardColor) => {
      if (!serverState) return;
      const base = optimisticState ?? serverState;
      const baseHand = optimisticHand ?? serverHand;
      const predicted = predictPlayCard(base, baseHand, playerIdRef.current, card, chosenColor);
      setOptimisticState(predicted.state);
      setOptimisticHand(predicted.hand);
      send({ type: "playCard", cardId: card.id, chosenColor });
    },
    [serverState, serverHand, optimisticState, optimisticHand, send]
  );

  const draw = useCallback(() => {
    if (!serverState) return;
    const base = optimisticState ?? serverState;
    setOptimisticState(predictDrawCard(base));
    playSound("draw");
    send({ type: "drawCard" });
  }, [serverState, optimisticState, send]);

  const pass = useCallback(() => send({ type: "passTurn" }), [send]);
  const sayUno = useCallback(() => {
    playSound("uno");
    send({ type: "sayUno" });
  }, [send]);
  const catchUno = useCallback((targetId: string) => send({ type: "catchUno", targetId }), [send]);
  const startGame = useCallback(() => send({ type: "startGame" }), [send]);
  const nextRound = useCallback(() => send({ type: "nextRound" }), [send]);
  const updateSettings = useCallback(
    (settings: Partial<HostSettings>) => send({ type: "hostUpdateSettings", settings }),
    [send]
  );
  const leave = useCallback(() => send({ type: "leave" }), [send]);

  return {
    connected,
    state: optimisticState ?? serverState,
    hand: optimisticHand ?? serverHand,
    error,
    lastThrown,
    playerId: playerIdRef.current,
    actions: { playCard, draw, pass, sayUno, catchUno, startGame, nextRound, updateSettings, leave },
  };
}
