"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useUnoRoom } from "@/lib/useUnoRoom";
import { UnoCard } from "@/components/Card";
import { DrawPile } from "@/components/DrawPile";
import { DirectionIndicator } from "@/components/DirectionIndicator";
import { ActivityFeed } from "@/components/ActivityFeed";
import { PlayerList } from "@/components/PlayerList";
import { Hand } from "@/components/Hand";
import { HostSettingsPanel } from "@/components/HostSettingsPanel";
import { CardColor } from "@/lib/types";
import { isMuted, playSound, setMuted } from "@/lib/sound";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const roomCode = (params.code || "").toUpperCase();
  const queryName = searchParams.get("name") || "";

  const [name, setName] = useState<string>("");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (queryName) {
      setName(queryName);
      return;
    }
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("uno:name") : null;
    if (stored) setName(stored);
  }, [queryName]);

  if (!name) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="w-full max-w-xs text-center">
          <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Room {roomCode}</p>
          <h1 className="font-display font-bold text-2xl mb-6">What's your name?</h1>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value.slice(0, 20))}
            placeholder="e.g. Alice"
            className="w-full bg-panel border border-line rounded-xl px-4 py-3 mb-4 text-base outline-none focus:border-uno-yellow/60"
          />
          <button
            onClick={() => {
              if (!nameInput.trim()) return;
              window.localStorage.setItem("uno:name", nameInput.trim());
              setName(nameInput.trim());
            }}
            disabled={!nameInput.trim()}
            className="w-full bg-uno-yellow text-ink font-display font-bold py-3 rounded-xl disabled:opacity-30"
          >
            Join room
          </button>
        </div>
      </main>
    );
  }

  return <RoomInner roomCode={roomCode} name={name} />;
}

function RoomInner({ roomCode, name }: { roomCode: string; name: string }) {
  const router = useRouter();
  const { connected, state, hand, error, lastThrown, playerId, send } = useUnoRoom(roomCode, name);
  const [feedOpen, setFeedOpen] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [throwSeq, setThrowSeq] = useState(0);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const prevWinner = useRef<string | null>(null);
  const prevTurn = useRef<string | null>(null);

  useEffect(() => {
    if (lastThrown) setThrowSeq((n) => n + 1);
  }, [lastThrown]);

  useEffect(() => {
    if (state?.currentPlayerId !== prevTurn.current) {
      setHasDrawnThisTurn(false);
      prevTurn.current = state?.currentPlayerId ?? null;
    }
  }, [state?.currentPlayerId]);

  useEffect(() => {
    if (state?.matchWinnerId && state.matchWinnerId !== prevWinner.current) {
      playSound("win");
    }
    prevWinner.current = state?.matchWinnerId ?? null;
  }, [state?.matchWinnerId]);

  function toggleMute() {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }

  function copyCode() {
    navigator.clipboard?.writeText(roomCode);
  }

  function leave() {
    send({ type: "leave" });
    router.push("/");
  }

  if (!state) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-white/40 text-sm">{connected ? "Loading room..." : "Connecting..."}</p>
      </main>
    );
  }

  const me = state.players.find((p) => p.id === playerId);
  const isHost = state.hostId === playerId;
  const isMyTurn = state.currentPlayerId === playerId;

  return (
    <main className="h-dvh flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-line/70">
        <button onClick={copyCode} className="flex items-center gap-2 text-left">
          <span className="font-display font-bold tracking-[0.2em] text-lg">{roomCode}</span>
          <span className="text-[10px] text-white/35 uppercase">tap to copy</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFeedOpen((v) => !v)}
            className="lg:hidden text-xs bg-panel border border-line rounded-full px-3 py-1.5"
          >
            Activity
          </button>
          <button onClick={toggleMute} className="text-xs bg-panel border border-line rounded-full px-3 py-1.5">
            {muted ? "Unmute" : "Mute"}
          </button>
          <button onClick={leave} className="text-xs bg-panel border border-line rounded-full px-3 py-1.5 text-white/50">
            Leave
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-4 mt-2 rounded-lg bg-uno-red/15 border border-uno-red/30 text-uno-red text-xs px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex-1 grid lg:grid-cols-[1fr_260px] min-h-0">
        <div className="flex flex-col min-h-0">
          {state.phase === "lobby" && (
            <LobbyView state={state} isHost={isHost} playerId={playerId} send={send} />
          )}

          {(state.phase === "playing" || state.phase === "roundEnd" || state.phase === "matchEnd") && (
            <div className="flex-1 flex flex-col min-h-0 px-4 py-3 gap-4">
              <PlayerList
                players={state.players}
                selfId={playerId}
                currentPlayerId={state.currentPlayerId}
                vulnerable={state.vulnerableToUnoCallout}
                onCatch={(targetId) => send({ type: "catchUno", targetId })}
              />

              <div className="flex-1 flex items-center justify-center gap-6 md:gap-10">
                <DirectionIndicator direction={state.direction} />

                <div className="flex flex-col items-center gap-1.5">
                  {state.discardTop ? (
                    <div key={throwSeq} className="animate-throw">
                      <UnoCard card={state.discardTop} size="xl" />
                    </div>
                  ) : (
                    <div className="w-24 h-36" />
                  )}
                  {state.currentColor && (
                    <span
                      className="text-[10px] uppercase tracking-widest font-semibold"
                      style={{ color: colorHex(state.currentColor) }}
                    >
                      {state.currentColor}
                    </span>
                  )}
                </div>

                <DrawPile
                  count={state.drawPileCount}
                  canDraw={isMyTurn && state.phase === "playing" && !hasDrawnThisTurn}
                  onDraw={() => {
                    playSound("draw");
                    setHasDrawnThisTurn(true);
                    send({ type: "drawCard" });
                  }}
                />
              </div>

              <p className="text-center text-sm text-white/60 h-5">
                {state.phase === "playing" &&
                  (isMyTurn ? "Your turn" : `${state.players.find((p) => p.id === state.currentPlayerId)?.name}'s turn`)}
              </p>
            </div>
          )}

          {state.phase === "roundEnd" && (
            <RoundEndOverlay state={state} isHost={isHost} send={send} />
          )}
          {state.phase === "matchEnd" && (
            <MatchEndOverlay state={state} isHost={isHost} send={send} />
          )}

          {state.phase === "playing" && (
            <Hand
              cards={hand}
              isMyTurn={isMyTurn}
              topColor={state.currentColor}
              topCard={state.discardTop}
              hasDrawn={hasDrawnThisTurn}
              saidUno={me?.saidUno ?? true}
              onPlay={(cardId, chosenColor) => {
                setHasDrawnThisTurn(false);
                send({ type: "playCard", cardId, chosenColor });
              }}
              onDraw={() => {
                playSound("draw");
                setHasDrawnThisTurn(true);
                send({ type: "drawCard" });
              }}
              onPass={() => send({ type: "passTurn" })}
              onSayUno={() => {
                playSound("uno");
                send({ type: "sayUno" });
              }}
            />
          )}
        </div>

        <aside
          className={`border-l border-line/70 bg-panel/40 p-4 flex-col ${
            feedOpen ? "flex fixed inset-x-0 bottom-0 top-14 z-40 bg-ink" : "hidden"
          } lg:static lg:flex lg:z-auto`}
        >
          <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Activity</p>
          <ActivityFeed events={state.activity} />
        </aside>
      </div>
    </main>
  );
}

function LobbyView({ state, isHost, playerId, send }: any) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">
          Players ({state.players.filter((p: any) => p.connected).length})
        </p>
        <div className="space-y-1.5">
          {state.players.map((p: any) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-line bg-panel/60 px-3 py-2"
            >
              <span className="text-sm">
                {p.name} {p.id === playerId && <span className="text-white/30">(you)</span>}
              </span>
              {p.isHost && <span className="text-uno-yellow text-xs">★ host</span>}
            </div>
          ))}
        </div>
      </div>

      <HostSettingsPanel
        settings={state.settings}
        isHost={isHost}
        onChange={(patch) => send({ type: "hostUpdateSettings", settings: patch })}
      />

      {isHost ? (
        <button
          onClick={() => send({ type: "startGame" })}
          disabled={state.players.filter((p: any) => p.connected).length < 2}
          className="w-full bg-uno-yellow text-ink font-display font-bold py-3.5 rounded-xl disabled:opacity-30"
        >
          {state.players.filter((p: any) => p.connected).length < 2 ? "Need 2+ players" : "Start game"}
        </button>
      ) : (
        <p className="text-center text-sm text-white/40">Waiting for the host to start...</p>
      )}
    </div>
  );
}

function RoundEndOverlay({ state, isHost, send }: any) {
  const winner = state.players.find((p: any) => p.id === state.lastRoundWinnerId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm rounded-2xl bg-panel border border-line p-6 text-center animate-popIn">
        <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Round over</p>
        <h2 className="font-display font-bold text-2xl mb-1">{winner?.name} scores!</h2>
        <p className="text-white/60 text-sm mb-5">+{state.lastRoundPoints} points</p>
        <div className="space-y-1 mb-6 text-sm">
          {[...state.players]
            .sort((a: any, b: any) => b.score - a.score)
            .map((p: any) => (
              <div key={p.id} className="flex justify-between text-white/70">
                <span>{p.name}</span>
                <span className="font-medium text-white/90">{p.score}</span>
              </div>
            ))}
        </div>
        {isHost ? (
          <button
            onClick={() => send({ type: "nextRound" })}
            className="w-full bg-uno-yellow text-ink font-display font-bold py-3 rounded-xl"
          >
            Next round
          </button>
        ) : (
          <p className="text-xs text-white/40">Waiting for host to continue...</p>
        )}
      </div>
    </div>
  );
}

function MatchEndOverlay({ state, isHost, send }: any) {
  const winner = state.players.find((p: any) => p.id === state.matchWinnerId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm rounded-2xl bg-panel border border-uno-yellow/40 p-6 text-center animate-popIn">
        <p className="text-uno-yellow text-xs uppercase tracking-wide mb-2">Match over</p>
        <h2 className="font-display font-bold text-3xl mb-6">{winner?.name} wins!</h2>
        {isHost ? (
          <button
            onClick={() => send({ type: "startGame" })}
            className="w-full bg-uno-yellow text-ink font-display font-bold py-3 rounded-xl"
          >
            Play again
          </button>
        ) : (
          <p className="text-xs text-white/40">Waiting for host to start a new game...</p>
        )}
      </div>
    </div>
  );
}

function colorHex(c: CardColor): string {
  switch (c) {
    case "red":
      return "#E5484D";
    case "yellow":
      return "#F0B429";
    case "green":
      return "#2FB170";
    case "blue":
      return "#3E7BFA";
    default:
      return "#B9B9B9";
  }
}
