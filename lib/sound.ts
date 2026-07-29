type SoundName = "throw" | "wild" | "draw" | "turn" | "win" | "uno";

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, gainPeak: number) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainPeak, c.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration + 0.02);
}

export function setMuted(v: boolean) {
  muted = v;
}
export function isMuted() {
  return muted;
}

export function playSound(name: SoundName) {
  if (muted) return;
  switch (name) {
    case "throw":
      tone(520, 0, 0.09, "triangle", 0.18);
      tone(720, 0.03, 0.07, "triangle", 0.12);
      break;
    case "draw":
      tone(260, 0, 0.08, "sawtooth", 0.1);
      break;
    case "wild":
      tone(300, 0, 0.1, "sine", 0.15);
      tone(450, 0.08, 0.1, "sine", 0.15);
      tone(600, 0.16, 0.14, "sine", 0.18);
      break;
    case "turn":
      tone(880, 0, 0.05, "sine", 0.08);
      break;
    case "uno":
      tone(660, 0, 0.08, "square", 0.15);
      tone(990, 0.09, 0.12, "square", 0.15);
      break;
    case "win":
      tone(523, 0, 0.12, "triangle", 0.2);
      tone(659, 0.12, 0.12, "triangle", 0.2);
      tone(784, 0.24, 0.2, "triangle", 0.22);
      break;
  }
}
