"use client";

import { CardBack } from "./Card";

export function DrawPile({
  count,
  canDraw,
  onDraw,
}: {
  count: number;
  canDraw: boolean;
  onDraw: () => void;
}) {
  const layers = Math.min(4, Math.max(1, Math.ceil(count / 20)));

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onDraw}
        disabled={!canDraw}
        className={`pack-stack card-scene w-16 h-24 md:w-20 md:h-28 relative btn-tactile rounded-xl ${
          canDraw ? "cursor-pointer" : "cursor-default opacity-70"
        }`}
        aria-label="Draw a card"
      >
        {Array.from({ length: layers }).map((_, i) => (
          <div key={i} className="layer" style={{ transform: `translate(${i * 2}px, ${-i * 2}px)`, zIndex: i }}>
            <CardBack size="md" />
          </div>
        ))}
        {canDraw && (
          <div
            className="absolute -inset-1 rounded-xl animate-pulseRing pointer-events-none"
            style={{ zIndex: layers + 1 }}
          />
        )}
      </button>
      <span className="text-[11px] uppercase tracking-wide text-white/40 font-medium">{count} left</span>
    </div>
  );
}
