import { useCallback, useRef } from 'react';

// ----- Persistent mute state via localStorage -----
const MUTE_KEY = 'uno_muted';
export function getSoundMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}
export function setSoundMuted(v: boolean) {
  try { localStorage.setItem(MUTE_KEY, v ? '1' : '0'); } catch { /* ignore */ }
}

// ----- Web Audio helpers -----
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try { return new AudioContext(); } catch { return null; }
}

function ramp(param: AudioParam, from: number, to: number, dur: number, ctx: AudioContext) {
  param.setValueAtTime(from, ctx.currentTime);
  param.exponentialRampToValueAtTime(Math.max(to, 0.0001), ctx.currentTime + dur);
}

function playTone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.25) {
  if (getSoundMuted()) return;
  const ctx = getCtx(); if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  ramp(gain.gain, vol, 0.0001, dur, ctx);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + dur + 0.05);
  osc.onended = () => ctx.close();
}

function playNoise(dur: number, filterFreq = 2000, vol = 0.15) {
  if (getSoundMuted()) return;
  const ctx = getCtx(); if (!ctx) return;
  const bufLen = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.5);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.value = vol;
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(); src.stop(ctx.currentTime + dur);
  src.onended = () => ctx.close();
}

// ----- Public sound functions -----
export function soundCardPlay() {
  playNoise(0.12, 3000, 0.2);
  playTone(600, 0.08, 'triangle', 0.12);
}

export function soundCardDraw() {
  playNoise(0.15, 800, 0.15);
  playTone(200, 0.1, 'sine', 0.1);
}

export function soundUnoCall() {
  if (getSoundMuted()) return;
  const ctx = getCtx(); if (!ctx) return;
  [440, 660].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(start); osc.stop(start + 0.15);
  });
  setTimeout(() => ctx.close(), 500);
}

export function soundWildCard() {
  if (getSoundMuted()) return;
  const ctx = getCtx(); if (!ctx) return;
  [261, 329, 392, 523].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0.18, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(start); osc.stop(start + 0.4);
  });
  setTimeout(() => ctx.close(), 800);
}

export function soundVictory() {
  if (getSoundMuted()) return;
  const ctx = getCtx(); if (!ctx) return;
  [261, 329, 392, 523, 659].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.22, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(start); osc.stop(start + 0.5);
  });
  setTimeout(() => ctx.close(), 1200);
}

export function soundCountdownTick() {
  playTone(880, 0.06, 'square', 0.12);
}

export function soundButtonClick() {
  playTone(1200, 0.04, 'sine', 0.08);
}

export function soundSkip() {
  playTone(350, 0.1, 'sawtooth', 0.1);
  setTimeout(() => playTone(250, 0.08, 'sawtooth', 0.08), 80);
}

// ----- Hook -----
export function useSound() {
  const muted = useRef(getSoundMuted());

  const toggleMute = useCallback(() => {
    muted.current = !muted.current;
    setSoundMuted(muted.current);
    return muted.current;
  }, []);

  return {
    isMuted: () => getSoundMuted(),
    toggleMute,
    play: {
      cardPlay: soundCardPlay,
      cardDraw: soundCardDraw,
      unoCall: soundUnoCall,
      wildCard: soundWildCard,
      victory: soundVictory,
      tick: soundCountdownTick,
      click: soundButtonClick,
      skip: soundSkip,
    },
  };
}
