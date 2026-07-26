import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { UnoCard } from '@/components/ui/UnoCard';
import { ROUTES } from '@/constants/routes';

// Mock players (will be replaced by RoomContext in Milestone 3)
const MOCK_PLAYERS = [
  { id: '1', name: 'You',   isReady: false, isHost: false, isYou: true  },
  { id: '2', name: 'Alice', isReady: true,  isHost: true,  isYou: false },
  { id: '3', name: 'Bob',   isReady: false, isHost: false, isYou: false },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="ml-2 rounded-lg px-3 py-1 text-xs font-semibold transition-all"
      style={{
        background: copied ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.08)',
        color: copied ? '#30d158' : '#fff',
        border: `1px solid ${copied ? 'rgba(48,209,88,0.3)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [players] = useState(MOCK_PLAYERS);

  const readyCount = players.filter(p => p.isReady || (p.isYou && ready)).length;
  const allReady = readyCount === players.length;
  const isHost = players.find(p => p.isHost && !p.isYou); // you are not host in mock

  return (
    <div className="animated-bg flex min-h-dvh flex-col overflow-hidden">
      {/* Header */}
      <motion.header
        className="glass z-10 flex items-center justify-between px-5 py-3"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(145deg,#c91c31,#e63946)' }}>
            <span className="text-xs font-black text-white">UNO</span>
          </div>
          <span className="font-semibold text-white">Lobby</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.home)}>Leave</Button>
      </motion.header>

      <div className="flex flex-1 flex-col items-center justify-start gap-6 px-4 py-8 max-w-lg mx-auto w-full">
        {/* Room code */}
        <motion.div
          className="glass-strong w-full rounded-3xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-uno-muted mb-2">Room Code</p>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-black tracking-[0.2em] text-white" style={{ textShadow: '0 0 20px rgba(230,57,70,0.5)' }}>
              {code ?? '------'}
            </span>
            <CopyButton text={code ?? ''} />
          </div>
          <p className="mt-2 text-xs text-uno-muted">Share this code with friends</p>
        </motion.div>

        {/* Players list */}
        <motion.div
          className="glass w-full rounded-3xl p-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Players</h2>
            <span className="text-xs text-uno-muted">{players.length} / 10</span>
          </div>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {players.map((p, i) => {
                const isActuallyReady = p.isYou ? ready : p.isReady;
                return (
                  <motion.div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl px-4 py-3"
                    style={{ background: p.isYou ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
                        style={{ background: ['#e63946','#1e88e5','#43a047','#fb8c00'][i % 4] }}>
                        {p.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{p.name}</span>
                          {p.isHost && <span className="rounded bg-uno-yellow/20 px-1.5 py-0.5 text-[10px] font-bold text-uno-yellow">HOST</span>}
                          {p.isYou && <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-uno-muted">You</span>}
                        </div>
                      </div>
                    </div>
                    <motion.div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                      style={{ background: isActuallyReady ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.06)' }}
                      animate={{ scale: isActuallyReady ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isActuallyReady ? '✓' : '·'}
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Waiting slots */}
          {players.length < 10 && (
            <div className="mt-2 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-center">
              <span className="text-xs text-uno-muted">Waiting for players… ({10 - players.length} spots left)</span>
            </div>
          )}
        </motion.div>

        {/* Preview cards */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          {[
            { color: 'red' as const, value: 'back' as const },
            { color: 'blue' as const, value: 'back' as const },
            { color: 'green' as const, value: 'back' as const },
          ].map((c, i) => (
            <motion.div key={i} style={{ opacity: 0.5 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}>
              <UnoCard color={c.color} value={c.value} size="sm" />
            </motion.div>
          ))}
        </motion.div>

        {/* Ready / Start buttons */}
        <motion.div
          className="w-full flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          {!isHost ? (
            <button
              onClick={() => setReady(r => !r)}
              className="w-full h-13 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95"
              style={{
                background: ready
                  ? 'linear-gradient(135deg,#1b5e20,#43a047)'
                  : 'linear-gradient(135deg,#0d47a1,#1e88e5)',
                boxShadow: ready
                  ? '0 4px 20px rgba(67,160,71,0.4)'
                  : '0 4px 20px rgba(30,136,229,0.4)',
              }}
            >
              {ready ? '✓ Ready!' : 'Mark as Ready'}
            </button>
          ) : (
            <button
              disabled={!allReady}
              className="w-full h-13 rounded-2xl font-bold text-white text-base transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg,#c91c31,#e63946)',
                boxShadow: '0 4px 24px rgba(230,57,70,0.45)',
              }}
            >
              {allReady ? '🎮 Start Game' : `Waiting… (${readyCount}/${players.length} ready)`}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
