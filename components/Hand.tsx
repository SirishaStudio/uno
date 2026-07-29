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
  onPlay: (cardId: string, chosenColor?: CardColor) => void;
  onDraw: () => void;
  onPass: () => void;
  onSayUno: () => void;
}) {
  const [pendingWildId, setPendingWildId] = useState<string | null>(null);

  const anyPlayable =
    isMyTurn && topColor && topCard ? cards.some((c) => canPlayCard(c, topColor, topCard)) : false;

  function handleTap(card: Card) {
    if (!isMyTurn || !topColor || !topCard) return;
    if (!canPlayCard(card, topColor, topCard)) return;
    if (card.kind === "wild" || card.kind === "wild4") {
      setPendingWildId(card.id);
      return;
    }
    onPlay(card.id);
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-3 mb-1.5">
        <div className="text-[11px] uppercase tracking-wide text-white/40">
          Your hand · {cards.length} card{cards.length === 1 ? "" : "s"}
        </div>
        <div className="flex gap-2">
          {cards.length === 1 && !saidUno && (
            <button
              onClick={onSayUno}
              className="text-[11px] font-semibold bg-uno-red px-2.5 py-1 rounded-full animate-pulseRing"
            >
              Call UNO!
            </button>
          )}
          {isMyTurn && !hasDrawn && !anyPlayable && (
            <button onClick={onDraw} className="text-[11px] font-semibold bg-uno-blue/90 px-2.5 py-1 rounded-full">
              Draw
            </button>
          )}
          {isMyTurn && hasDrawn && (
            <button onClick={onPass} className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-full">
              Pass
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-3 pb-3 pt-1">
        {cards.map((c) => {
          const playable = isMyTurn && topColor && topCard ? canPlayCard(c, topColor, topCard) : false;
          return (
            <UnoCard
              key={c.id}
              card={c}
              size="lg"
              onClick={isMyTurn ? () => handleTap(c) : undefined}
              disabled={isMyTurn ? !playable : true}
            />
          );
        })}
        {cards.length === 0 && <p className="text-white/30 text-sm py-8 mx-auto">No cards — nice!</p>}
      </div>

      {pendingWildId && (
        <ColorPicker
          onPick={(color) => {
            onPlay(pendingWildId, color);
            setPendingWildId(null);
          }}
          onCancel={() => setPendingWildId(null)}
        />
      )}
    </div>
  );
}
