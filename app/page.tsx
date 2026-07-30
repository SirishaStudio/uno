"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { customAlphabet } from "nanoid";
import { useMotion } from "@/lib/motion";

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

const HERO_CARDS: { label: string; color: string; edge: string }[] = [
  { label: "7", color: "#E5484D", edge: "#E5484D" },
  { label: "SKIP", color: "#F0B429", edge: "#F0B429" },
  { label: "WILD", color: "#B9B9B9", edge: "linear-gradient(90deg,#E5484D,#F0B429,#2FB170,#3E7BFA)" },
  { label: "+2", color: "#2FB170", edge: "#2FB170" },
  { label: "4", color: "#3E7BFA", edge: "#3E7BFA" },
];

export default function Home() {
  const router = useRouter();
  const { level } = useMotion();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"start" | "join">("start");
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function persistName(n: string) {
    if (typeof window !== "undefined") window.localStorage.setItem("uno:name", n);
  }

  function handleCreate() {
    if (!name.trim()) return;
    persistName(name.trim());
    const code = genCode();
    router.push(`/room/${code}?name=${encodeURIComponent(name.trim())}`);
  }

  function handleJoin() {
    if (!name.trim() || joinCode.trim().length < 4) return;
    persistName(name.trim());
    router.push(`/room/${joinCode.trim().toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (level === "reduced" || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -14, y: px * 14 });
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="aurora" />

      <div
        ref={heroRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        className="relative z-10 mb-8 h-32 md:h-40 w-full max-w-sm flex items-center justify-center"
        style={{ perspective: 900 }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
        >
          {HERO_CARDS.map((c, i) => {
            const centerOffset = i - (HERO_CARDS.length - 1) / 2;
            return (
              <div
                key={i}
                className="absolute w-16 h-24 md:w-20 md:h-28 rounded-xl border border-line flex items-center justify-center font-display font-bold text-xl md:text-2xl text-white/95"
                style={{
                  background: "linear-gradient(160deg, #1B1D1F 0%, #131517 65%, #0E0F10 100%)",
                  transform: `translateX(${centerOffset * 34}px) rotateZ(${centerOffset * 9}deg) translateZ(${20 - Math.abs(centerOffset) * 12}px)`,
                  boxShadow: `0 0 0 1px ${typeof c.edge === "string" && c.edge.startsWith("#") ? c.edge + "55" : "rgba(255,255,255,0.15)"}, 0 14px 28px -8px rgba(0,0,0,0.6)`,
                }}
              >
                <div className="absolute inset-x-0 top-0 h-[5px] rounded-t-xl" style={{ background: c.edge }} />
                {c.label}
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex items-end gap-2 mb-1 justify-center md:justify-start">
          <h1 className="font-display font-bold text-5xl tracking-tight">UNO</h1>
          <div className="flex gap-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-uno-red" />
            <span className="w-2 h-2 rounded-full bg-uno-yellow" />
            <span className="w-2 h-2 rounded-full bg-uno-green" />
            <span className="w-2 h-2 rounded-full bg-uno-blue" />
          </div>
        </div>
        <p className="text-white/45 text-sm mb-8 text-center md:text-left">
          No login. Enter a name, share a code, throw cards.
        </p>

        <label className="block text-xs uppercase tracking-wide text-white/40 mb-1.5">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder="e.g. Alice"
          className="w-full bg-panel border border-line rounded-xl px-4 py-3 mb-6 text-base outline-none focus:border-uno-yellow/60"
        />

        <div className="flex rounded-xl border border-line p-1 mb-5 glass-panel">
          <button
            onClick={() => setMode("start")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "start" ? "bg-card text-white" : "text-white/40"
            }`}
          >
            New room
          </button>
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "join" ? "bg-card text-white" : "text-white/40"
            }`}
          >
            Join room
          </button>
        </div>

        {mode === "start" ? (
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="btn-tactile w-full bg-uno-yellow text-ink font-display font-bold py-3.5 rounded-xl disabled:opacity-30"
          >
            Create room
          </button>
        ) : (
          <div className="space-y-3">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ROOM CODE"
              className="w-full bg-panel border border-line rounded-xl px-4 py-3 text-base tracking-[0.3em] text-center uppercase outline-none focus:border-uno-yellow/60"
            />
            <button
              onClick={handleJoin}
              disabled={!name.trim() || joinCode.trim().length < 4}
              className="btn-tactile w-full bg-uno-yellow text-ink font-display font-bold py-3.5 rounded-xl disabled:opacity-30"
            >
              Join room
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
