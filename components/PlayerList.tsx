"use client";

import { Player } from "@/lib/types";

export function PlayerList({
  players,
  selfId,
  currentPlayerId,
  vulnerable,
  onCatch,
}: {
  players: Player[];
  selfId: string;
  currentPlayerId: string | null;
  vulnerable: string[];
  onCatch: (targetId: string) => void;
}) {
  const others = players.filter((p) => p.id !== selfId);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {others.map((p) => {
        const isTurn = p.id === currentPlayerId;
        const isVulnerable = vulnerable.includes(p.id);
        return (
          <div
            key={p.id}
            className={`relative flex items-center gap-2 rounded-xl border px-3 py-2 min-w-[8.5rem] transition-colors ${
              isTurn ? "border-uno-yellow/70 bg-uno-yellow/[0.06]" : "border-line bg-panel/60"
            } ${!p.connected ? "opacity-40" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {p.isHost && (
                  <span className="text-[10px] text-uno-yellow" title="Host">
                    ★
                  </span>
                )}
                <span className="text-sm font-medium truncate">{p.name}</span>
              </div>
              <div className="text-[11px] text-white/45">
                {p.handCount} card{p.handCount === 1 ? "" : "s"}
                {isVulnerable && <span className="text-uno-red ml-1 font-semibold">UNO!</span>}
              </div>
            </div>
            {isTurn && <span className="w-2 h-2 rounded-full bg-uno-yellow animate-pulse shrink-0" />}
            {isVulnerable && (
              <button
                onClick={() => onCatch(p.id)}
                className="absolute -bottom-2 right-2 text-[10px] font-semibold bg-uno-red text-white px-2 py-0.5 rounded-full shadow active:scale-95"
              >
                Catch!
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
