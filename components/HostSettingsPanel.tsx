"use client";

import { HostSettings } from "@/lib/types";

export function HostSettingsPanel({
  settings,
  isHost,
  onChange,
}: {
  settings: HostSettings;
  isHost: boolean;
  onChange: (patch: Partial<HostSettings>) => void;
}) {
  if (!isHost) {
    return (
      <div className="rounded-2xl glass-panel border border-line p-4 text-sm text-white/60 space-y-1">
        <p>
          Mode: <span className="text-white/90 font-medium">{settings.gameMode === "wild" ? "Wild" : "Normal"}</span>
        </p>
        <p>
          Win condition:{" "}
          <span className="text-white/90 font-medium">
            {settings.winCondition === "score" ? `Score race to ${settings.targetScore}` : "Classic — first to 0"}
          </span>
        </p>
        {settings.turnTimerSeconds > 0 && (
          <p>
            Turn timer: <span className="text-white/90 font-medium">{settings.turnTimerSeconds}s</span>
          </p>
        )}
        <p className="text-white/40 text-xs pt-1">Waiting for the host to start...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-panel border border-line p-4 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Deck</p>
        <div className="grid grid-cols-2 gap-2">
          {(["normal", "wild"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onChange({ gameMode: m })}
              className={`btn-tactile py-2 rounded-lg text-sm font-medium border ${
                settings.gameMode === m ? "border-uno-yellow text-uno-yellow bg-uno-yellow/10" : "border-line text-white/60"
              }`}
            >
              {m === "normal" ? "Normal (108)" : "Wild"}
            </button>
          ))}
        </div>
        {settings.gameMode === "wild" && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>Wild intensity</span>
              <span>{settings.wildIntensity}/3</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={settings.wildIntensity}
              onChange={(e) => onChange({ wildIntensity: Number(e.target.value) })}
              className="w-full accent-uno-yellow"
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Win condition</p>
        <div className="grid grid-cols-2 gap-2">
          {(["classic", "score"] as const).map((w) => (
            <button
              key={w}
              onClick={() => onChange({ winCondition: w })}
              className={`btn-tactile py-2 rounded-lg text-sm font-medium border ${
                settings.winCondition === w ? "border-uno-yellow text-uno-yellow bg-uno-yellow/10" : "border-line text-white/60"
              }`}
            >
              {w === "classic" ? "Classic" : "Score race"}
            </button>
          ))}
        </div>
        {settings.winCondition === "score" && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-white/50">Target score</span>
            <input
              type="number"
              min={100}
              step={50}
              value={settings.targetScore}
              onChange={(e) => onChange({ targetScore: Math.max(100, Number(e.target.value)) })}
              className="flex-1 bg-card border border-line rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Starting hand size</p>
        <input
          type="range"
          min={5}
          max={9}
          step={1}
          value={settings.startingHandSize}
          onChange={(e) => onChange({ startingHandSize: Number(e.target.value) })}
          className="w-full accent-uno-yellow"
        />
        <div className="text-right text-xs text-white/50">{settings.startingHandSize} cards</div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Turn timer</p>
        <div className="grid grid-cols-4 gap-2">
          {[0, 15, 30, 60].map((secs) => (
            <button
              key={secs}
              onClick={() => onChange({ turnTimerSeconds: secs })}
              className={`btn-tactile py-2 rounded-lg text-xs font-medium border ${
                settings.turnTimerSeconds === secs ? "border-uno-yellow text-uno-yellow bg-uno-yellow/10" : "border-line text-white/60"
              }`}
            >
              {secs === 0 ? "Off" : `${secs}s`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
