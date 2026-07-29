"use client";

export function DirectionIndicator({ direction }: { direction: 1 | -1 }) {
  return (
    <div
      className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-line bg-panel/80 flex items-center justify-center transition-transform duration-300"
      style={{ transform: direction === -1 ? "scaleX(-1)" : "scaleX(1)" }}
      aria-label={direction === 1 ? "Turn order clockwise" : "Turn order counter-clockwise"}
      title={direction === 1 ? "Clockwise" : "Counter-clockwise"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-uno-yellow">
        <path
          d="M4 12a8 8 0 0 1 14.5-4.6M20 12a8 8 0 0 1-14.5 4.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M17 4.5 18.7 7.7 21.8 6.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 19.5 5.3 16.3 2.2 17.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
