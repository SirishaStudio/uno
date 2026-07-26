import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { validateDisplayName } from '@/utils/displayName';

interface Props {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function GuestNameModal({ open, busy, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(''); setError(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateDisplayName(name);
    if (err) { setError(err); return; }
    onSubmit(name.trim());
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !busy && onClose()}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />

          {/* Sheet */}
          <motion.div
            className="glass-strong relative z-10 w-full max-w-sm rounded-3xl p-7"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <h2 className="text-xl font-bold text-white mb-1">Choose your name</h2>
            <p className="text-sm text-uno-muted mb-6">2–16 characters. You can change it later.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(null); }}
                  placeholder="e.g. CoolPlayer99"
                  maxLength={16}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-uno-muted outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/8 focus:ring-0"
                  style={{ fontSize: 16 }}
                  disabled={busy}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-400"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  disabled={busy}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" loading={busy} disabled={!name.trim()}>
                  Let's play!
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
