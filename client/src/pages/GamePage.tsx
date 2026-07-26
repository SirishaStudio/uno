import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { UnoCard, CardStack } from '@/components/ui/UnoCard';
import { Button } from '@/components/ui/Button';
import { soundCardPlay, soundCardDraw, soundUnoCall, soundWildCard } from '@/hooks/useSound';
import { ROUTES } from '@/constants/routes';

// ─── Mock game state (will be replaced by Socket.IO in Milestone 5) ────────────
const MOCK_HAND = [
  { color: 'red'    as const, value: '3' as const },
  { color: 'red'    as const, value: '7' as const },
  { color: 'blue'   as const, value: 'skip' as const },
  { color: 'blue'   as const, value: '5' as const },
  { color: 'green'  as const, value: 'reverse' as const },
  { color: 'yellow' as const, value: 'draw_two' as const },
  { color: 'wild'   as const, value: 'wild' as const },
];

const MOCK_DISCARD = { color: 'red' as const, value: '3' as const };
const MOCK_PLAYERS = [
  { name: 'Alice',  cards: 4,  isCurrentTurn: false },
  { name: 'Bob',    cards: 7,  isCurrentTurn: true  },
  { name: 'Carol',  cards: 2,  isCurrentTurn: false },
];

const COLOR_PICK = ['red', 'blue', 'green', 'yellow'] as const;

function DirectionArrow({ clockwise }: { clockwise: boolean }) {
  return (
    <motion.div
      animate={{ rotate: clockwise ? [0, 360] : [0, -360] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      className="text-2xl"
    >
      {clockwise ? '↻' : '↺'}
    </motion.div>
  );
}

function TurnTimer({ seconds = 30 }: { seconds?: number }) {
  const pct = (seconds / 30) * 100;
  const color = seconds <= 10 ? '#ff2d55' : seconds <= 20 ? '#ffd60a' : '#30d158';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-12 w-12">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <motion.circle
            cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="3"
            strokeLinecap="round"
            style={{ strokeDasharray: '113.1', strokeDashoffset: 113.1 * (1 - pct / 100) }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{seconds}</span>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ onPick }: { onPick: (color: typeof COLOR_PICK[number]) => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <motion.div
        className="glass-strong rounded-3xl p-8 text-center"
        initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <p className="mb-5 text-lg font-bold text-white">Choose a color</p>
        <div className="flex gap-4">
          {COLOR_PICK.map(c => {
            const bgs: Record<string, string> = {
              red: '#e53935', blue: '#1e88e5', green: '#43a047', yellow: '#fb8c00',
            };
            return (
              <motion.button
                key={c}
                onClick={() => onPick(c)}
                className="h-16 w-16 rounded-2xl border-2 border-white/20 transition-all"
                style={{ background: bgs[c], boxShadow: `0 4px 20px ${bgs[c]}80` }}
                whileHover={{ scale: 1.12, boxShadow: `0 8px 32px ${bgs[c]}cc` }}
                whileTap={{ scale: 0.95 }}
              />
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [hand, setHand] = useState(MOCK_HAND);
  const [discard, setDiscard] = useState(MOCK_DISCARD);
  const [unoActive, setUnoActive] = useState(false);
  const [showColorPick, setShowColorPick] = useState(false);
  const [pendingWildIdx, setPendingWildIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const isPlayable = useCallback((card: typeof MOCK_HAND[number]) => {
    return card.color === discard.color
      || card.value === discard.value
      || card.color === 'wild';
  }, [discard]);

  const onCardClick = (idx: number) => {
    const card = hand[idx];
    if (!isPlayable(card)) return;
    if (card.color === 'wild') {
      soundWildCard();
      setPendingWildIdx(idx);
      setShowColorPick(true);
    } else {
      soundCardPlay();
      playCard(idx, card.color);
    }
  };

  const playCard = (idx: number, resolvedColor: typeof COLOR_PICK[number]) => {
    const card = hand[idx];
    setDiscard({ color: resolvedColor, value: card.value });
    setHand(prev => prev.filter((_, i) => i !== idx));
    setSelectedIdx(null);
  };

  const onColorPick = (color: typeof COLOR_PICK[number]) => {
    if (pendingWildIdx !== null) {
      playCard(pendingWildIdx, color);
      setPendingWildIdx(null);
    }
    setShowColorPick(false);
  };

  const onDraw = () => {
    soundCardDraw();
    setHand(prev => [...prev, { color: 'red' as const, value: '1' as const }]);
  };

  const onUno = () => {
    soundUnoCall();
    setUnoActive(true);
    setTimeout(() => setUnoActive(false), 3000);
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden select-none"
      style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 0%,rgba(230,57,70,0.08) 0%,transparent 60%), #0a0a0f' }}
    >
      {/* ── Header ── */}
      <header className="glass z-20 flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(145deg,#c91c31,#e63946)' }}>
            <span className="text-xs font-black text-white">UNO</span>
          </div>
          {code && (
            <div className="glass rounded-lg px-3 py-1 text-xs font-mono font-bold tracking-widest text-white">
              {code}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <TurnTimer seconds={22} />
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.home)}>Leave</Button>
        </div>
      </header>

      {/* ── Opponents ── */}
      <div className="flex flex-wrap justify-center gap-4 px-4 py-3 z-10">
        {MOCK_PLAYERS.map((p, i) => (
          <motion.div
            key={i}
            className={`glass rounded-2xl px-4 py-2 flex flex-col items-center gap-2 transition-all ${p.isCurrentTurn ? 'turn-pulse border border-uno-yellow/40' : ''}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-2">
              {p.isCurrentTurn && (
                <motion.div className="h-2 w-2 rounded-full bg-uno-yellow"
                  animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
              )}
              <span className="text-xs font-semibold text-white">{p.name}</span>
              {p.cards === 1 && (
                <span className="rounded bg-uno-red px-1.5 py-0.5 text-[10px] font-black text-white">UNO!</span>
              )}
            </div>
            <CardStack count={p.cards} size="xs" />
          </motion.div>
        ))}
      </div>

      {/* ── Game table center ── */}
      <div className="flex flex-1 items-center justify-center gap-8 px-4 py-2">
        {/* Draw pile */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            onClick={onDraw}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            <UnoCard color="red" value="back" size="lg" interactive />
          </motion.div>
          <span className="text-xs text-uno-muted font-medium">Draw</span>
        </div>

        {/* Direction + game info */}
        <div className="flex flex-col items-center gap-3">
          <DirectionArrow clockwise={true} />
          <div className="glass rounded-2xl px-4 py-2 text-center">
            <p className="text-xs text-uno-muted">Bob's turn</p>
          </div>
        </div>

        {/* Discard pile */}
        <div className="flex flex-col items-center gap-2">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${discard.color}-${discard.value}`}
              initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <UnoCard color={discard.color} value={discard.value} size="lg" />
            </motion.div>
          </AnimatePresence>
          <span className="text-xs text-uno-muted font-medium">Discard</span>
        </div>
      </div>

      {/* ── Player hand ── */}
      <div className="relative z-10 px-4 pb-4">
        <div className="glass rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-uno-muted">Your hand ({hand.length})</span>
            <span className="text-xs text-uno-muted">Tap a card to play</span>
          </div>

          {/* Scrollable hand */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-center flex-wrap">
            <AnimatePresence>
              {hand.map((card, i) => {
                const playable = isPlayable(card);
                return (
                  <motion.div
                    key={`${card.color}-${card.value}-${i}`}
                    initial={{ scale: 0, y: 40 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: -40, opacity: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <UnoCard
                      color={card.color}
                      value={card.value}
                      size="md"
                      isPlayable={playable}
                      isSelected={selectedIdx === i}
                      interactive={playable}
                      onClick={() => onCardClick(i)}
                      style={{ opacity: playable ? 1 : 0.45 }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── UNO Button ── */}
      <AnimatePresence>
        {hand.length === 1 && (
          <motion.button
            className="fixed bottom-36 right-4 z-30 rounded-full font-black text-white shadow-2xl"
            style={{
              width: 72, height: 72, fontSize: 15,
              background: 'linear-gradient(145deg,#c91c31 0%,#e63946 100%)',
              boxShadow: '0 0 0 0 rgba(255,45,85,0.7), 0 4px 20px rgba(255,45,85,0.5)',
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: 1, rotate: 0,
              boxShadow: [
                '0 0 0 0 rgba(255,45,85,0.7), 0 4px 20px rgba(255,45,85,0.5)',
                '0 0 0 16px rgba(255,45,85,0), 0 4px 20px rgba(255,45,85,0.5)',
                '0 0 0 0 rgba(255,45,85,0.7), 0 4px 20px rgba(255,45,85,0.5)',
              ],
            }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              scale: { type: 'spring', stiffness: 400, damping: 20 },
              boxShadow: { duration: 1.5, repeat: Infinity },
            }}
            onClick={onUno}
            aria-label="Call UNO!"
          >
            UNO!
          </motion.button>
        )}
      </AnimatePresence>

      {/* UNO called toast */}
      <AnimatePresence>
        {unoActive && (
          <motion.div
            className="fixed top-20 left-1/2 z-50 -translate-x-1/2"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
          >
            <div className="rounded-2xl px-6 py-3 text-xl font-black text-white"
              style={{ background: 'linear-gradient(135deg,#c91c31,#e63946)', boxShadow: '0 8px 32px rgba(230,57,70,0.6)' }}>
              🎴 UNO!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color picker modal */}
      {showColorPick && <ColorPicker onPick={onColorPick} />}
    </div>
  );
}
