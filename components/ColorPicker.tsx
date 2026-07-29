"use client";

import { CardColor } from "@/lib/types";

const OPTIONS: { color: CardColor; label: string; bg: string }[] = [
  { color: "red", label: "Red", bg: "bg-uno-red" },
  { color: "yellow", label: "Yellow", bg: "bg-uno-yellow" },
  { color: "green", label: "Green", bg: "bg-uno-green" },
  { color: "blue", label: "Blue", bg: "bg-uno-blue" },
];

export function ColorPicker({ onPick, onCancel }: { onPick: (c: CardColor) => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="w-full max-w-xs rounded-2xl bg-panel border border-line p-5 animate-popIn">
        <p className="font-display font-bold text-lg mb-4 text-center">Pick a color</p>
        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((o) => (
            <button
              key={o.color}
              onClick={() => onPick(o.color)}
              className={`${o.bg} h-20 rounded-xl font-display font-bold text-ink/90 active:scale-95 transition-transform`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button onClick={onCancel} className="mt-4 w-full text-sm text-white/50 hover:text-white/80 py-2">
          Cancel
        </button>
      </div>
    </div>
  );
}
