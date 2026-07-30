"use client";

export function DirectionIndicator({ direction }: { direction: 1 | -1 }) {
  return (
    <div
      className="relative w-11 h-11 md:w-14 md:h-14 shrink-0"
      aria-label={direction === 1 ? "Turn order clockwise" : "Turn order counter-clockwise"}
      title={direction === 1 ? "Clockwise" : "Counter-clockwise"}
    >
      <div
        className={`direction-ring ${direction === -1 ? "reverse" : ""} absolute inset-0 rounded-full`}
        style={{
          background:
            "conic-gradient(from 0deg, #F0B429, #E5484D, #3E7BFA, #2FB170, #F0B429)",
          boxShadow: "inset 0 0 0 3px #0A0B0C, 0 4px 12px -2px rgba(0,0,0,0.6)",
        }}
      />
      <div className="absolute inset-[3px] rounded-full bg-panel/95 flex items-center justify-center">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white/80"
          style={{ transform: direction === -1 ? "scaleX(-1)" : "none" }}
        >
          <path d="M4 12a8 8 0 0 1 14.5-4.6M20 12a8 8 0 0 1-14.5 4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 4.5 18.7 7.7 21.8 6.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 19.5 5.3 16.3 2.2 17.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
