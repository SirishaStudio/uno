"use client";

import { Player } from "@/lib/types";
import { CardBack } from "./Card";

function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

export function PlayerList({
  players,
  selfId,
  currentPlayerId,
  vulnerable,
  turnDeadline,
  onCatch,
}: {
  players: Player[];
  selfId: string;
  currentPlayerId: string | null;
  vulnerable: string[];
  turnDeadline: number | null;
  onCatch: (targetId: string) => void;
}) {
  const others = players.filter((p) => p.id !== selfId);

  return (
    <div className="flex flex-wrap gap-2.5 justify-center">
      {others.map((p) => {
        const isTurn = p.id === currentPlayerId;
        const isVulnerable = vulnerable.includes(p.id);
        const stackSize = Math.min(3, Math.max(1, Math.ceil(p.handCount / 4)));

        return (
          <div
            key={p.id}
            className={`relative flex items-center gap-2.5 rounded-2xl glass-panel border px-3 py-2.5 min-w-[9.5rem] transition-colors duration-300 ${
              isTurn ? "border-uno-yellow/70" : "border-line"
            } ${!p.connected ? "opacity-40" : ""}`}
            style={isTurn ? { boxShadow: "0 0 0 1px rgba(240,180,41,0.25), 0 0 24px -4px rgba(240,180,41,0.35)" } : undefined}
          >
            <div className="relative shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-display ${
                  isTurn ? "bg-uno-yellow text-ink" : "bg-white/10 text-white/70"
                }`}
              >
                {initials(p.name)}
              </div>
              {isTurn && turnDeadline && (
                <svg className="absolute -inset-1 w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(240,180,41,0.25)" strokeWidth="2.5" />
                  <circle
                    key={turnDeadline}
                    cx="22"
                    cy="22"
                    r="19"
                    fill="none"
                    stroke="#F0B429"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 19}
                    style={{
                      animation: `countdown-ring ${Math.max(0, turnDeadline - Date.now()) / 1000}s linear forwards`,
                    }}
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {p.isHost && <span className="text-[10px] text-uno-yellow shrink-0">★</span>}
                <span className="text-sm font-medium truncate">{p.name}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="relative flex" style={{ width: 8 + stackSize * 5 }}>
                  {Array.from({ length: stackSize }).map((_, i) => (
                    <div key={i} className="absolute" style={{ left: i * 5, top: 0 }}>
                      <CardBack size="sm" className="!w-3.5 !h-5" />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-white/45">{p.handCount}</span>
                {isVulnerable && <span className="text-uno-red text-[10px] font-bold">UNO!</span>}
              </div>
            </div>

            {isVulnerable && (
              <button
                onClick={() => onCatch(p.id)}
                className="btn-tactile absolute -bottom-2 right-2 text-[10px] font-semibold bg-uno-red text-white px-2.5 py-1 rounded-full"
              >
                Catch!
              </button>
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes countdown-ring {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: ${2 * Math.PI * 19}; }
        }
      `}</style>
    </div>
  );
}
