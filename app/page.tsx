"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customAlphabet } from "nanoid";

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"start" | "join">("start");

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

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-end gap-2 mb-1">
          <h1 className="font-display font-bold text-5xl tracking-tight">UNO</h1>
          <div className="flex gap-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-uno-red" />
            <span className="w-2 h-2 rounded-full bg-uno-yellow" />
            <span className="w-2 h-2 rounded-full bg-uno-green" />
            <span className="w-2 h-2 rounded-full bg-uno-blue" />
          </div>
        </div>
        <p className="text-white/45 text-sm mb-8">No login. Enter a name, share a code, throw cards.</p>

        <label className="block text-xs uppercase tracking-wide text-white/40 mb-1.5">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder="e.g. Alice"
          className="w-full bg-panel border border-line rounded-xl px-4 py-3 mb-6 text-base outline-none focus:border-uno-yellow/60"
        />

        <div className="flex rounded-xl border border-line p-1 mb-5 bg-panel/50">
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
            className="w-full bg-uno-yellow text-ink font-display font-bold py-3.5 rounded-xl disabled:opacity-30 active:scale-[0.98] transition-transform"
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
              className="w-full bg-uno-yellow text-ink font-display font-bold py-3.5 rounded-xl disabled:opacity-30 active:scale-[0.98] transition-transform"
            >
              Join room
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
