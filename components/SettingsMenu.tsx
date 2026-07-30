"use client";

import { useState } from "react";
import { useMotion } from "@/lib/motion";
import { isMuted, setMuted } from "@/lib/sound";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [muted, setMutedState] = useState(false);
  const { level, setLevel } = useMotion();

  function toggleMute() {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-tactile text-xs glass-panel border border-line rounded-full px-3 py-1.5 flex items-center gap-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 17.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 13a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 6.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 2.28a1.65 1.65 0 0 0 1-1.51V.68a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V6a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
        Settings
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl glass-panel border border-line p-3 z-50 space-y-3 animate-popIn">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1.5">Sound</p>
              <button
                onClick={toggleMute}
                className={`btn-tactile w-full py-1.5 rounded-lg text-xs font-medium border ${
                  muted ? "border-line text-white/60" : "border-uno-yellow text-uno-yellow bg-uno-yellow/10"
                }`}
              >
                {muted ? "Muted" : "Sound on"}
              </button>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/40 mb-1.5">Animations</p>
              <p className="text-[10px] text-white/35 mb-1.5">Reduce for older phones or if things feel laggy.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLevel("full")}
                  className={`btn-tactile py-1.5 rounded-lg text-xs font-medium border ${
                    level === "full" ? "border-uno-yellow text-uno-yellow bg-uno-yellow/10" : "border-line text-white/60"
                  }`}
                >
                  Full
                </button>
                <button
                  onClick={() => setLevel("reduced")}
                  className={`btn-tactile py-1.5 rounded-lg text-xs font-medium border ${
                    level === "reduced" ? "border-uno-yellow text-uno-yellow bg-uno-yellow/10" : "border-line text-white/60"
                  }`}
                >
                  Reduced
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
