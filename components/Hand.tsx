"use client";

import { useState } from "react";
import { Card, CardColor } from "@/lib/types";
import { canPlayCard } from "@/lib/rules";
import { UnoCard } from "./Card";
import { ColorPicker } from "./ColorPicker";

export function Hand({
  cards,
  isMyTurn,
  topColor,
  topCard,
  hasDrawn,
  saidUno,
  onPlay,
  onDraw,
  onPass,
  onSayUno,
}: {
  cards: Card[];
  isMyTurn: boolean;
  topColor: CardColor | null;
  topCard: Card | null;
  hasDrawn: boolean;
  saidUno: boolean;
  onPlay: (card: Card, chosenColor?: CardColor) => void;
  onDraw: () => void;
  onPass: () => void;
  onSayUno: () => void;
}) {
  const [pendingWild, setPendingWild] = useState<Card | null>(null);

  const anyPlayable =
    isMyTurn && topColor && topCard ? cards.some((c) => canPlayCard(c, topColor, topCard)) : false;

  function handleTap(card: Card) {
    if (!isMyTurn || !topColor || !topCard) return;
    if (!canPlayCard(card, topColor, topCard)) return;
    if (card.kind === "wild" || card.kind === "wild4") {
      setPendingWild(card);
      return;
    }
    onPlay(card);
  }

  return (
    <div className="relative z-10 w-full glass-panel border-t border-line/70">
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
        <div className="text-[11px] uppercase tracking-wide text-white/40">
          Your hand · {cards.length} card{cards.length === 1 ? "" : "s"}
        </div>
        <div className="flex gap-2">
          {cards.length === 1 && !saidUno && (
            <button
              onClick={onSayUno}
              className="btn-tactile text-[11px] font-semibold bg-uno-red px-3 py-1.5 rounded-full animate-pulseRing"
            >
              Call UNO!
            </button>
          )}
          {isMyTurn && !hasDrawn && !anyPlayable && (
            <button onClick={onDraw} className="btn-tactile text-[11px] font-semibold bg-uno-blue px-3 py-1.5 rounded-full">
              Draw
            </button>
          )}
          {isMyTurn && hasDrawn && (
            <button onClick={onPass} className="btn-tactile text-[11px] font-semibold bg-white/10 px-3 py-1.5 rounded-full">
              Pass
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-4 pb-4 pt-2">
        {cards.map((c, i) => {
          const playable = isMyTurn && topColor && topCard ? canPlayCard(c, topColor, topCard) : false;
          const tilt = ((i % 3) - 1) * 3; // -3 / 0 / 3 deg zig-zag, a cheap "fanned" feel
          return (
            <div key={c.id} style={{ transform: `rotate(${tilt}deg)` }} className="pt-2">
              <UnoCard
                card={c}
                size="lg"
                onClick={isMyTurn ? () => handleTap(c) : undefined}
                disabled={isMyTurn ? !playable : true}
              />
            </div>
          );
        })}
        {cards.length === 0 && <p className="text-white/30 text-sm py-8 mx-auto">No cards — nice!</p>}
      </div>

      {pendingWild && (
        <ColorPicker
          onPick={(color) => {
            onPlay(pendingWild, color);
            setPendingWild(null);
          }}
          onCancel={() => setPendingWild(null)}
        />
      )}
    </div>
  );
}
