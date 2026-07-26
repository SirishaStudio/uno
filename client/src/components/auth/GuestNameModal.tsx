import { useEffect, useId, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { sanitizeDisplayName, validateDisplayName } from '@/utils/displayName';

interface GuestNameModalProps {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (displayName: string) => void;
}

export function GuestNameModal({ open, busy, onClose, onSubmit }: GuestNameModalProps) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateDisplayName(name);
    if (validation) {
      setError(validation);
      return;
    }
    onSubmit(sanitizeDisplayName(name));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-uno-border bg-uno-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold">
          Choose a display name
        </h2>
        <p className="mt-1 text-sm text-uno-muted">Friends will see this name in the lobby.</p>
        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm text-uno-muted">
            Display name
            <input
              autoFocus
              value={name}
              maxLength={16}
              disabled={busy}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="rounded-xl border border-uno-border bg-uno-bg px-4 py-3 text-base text-white placeholder:text-uno-muted/50 focus:border-uno-yellow focus:outline-none"
              placeholder="e.g. Alex"
            />
          </label>
          {error ? (
            <p className="text-sm text-uno-red" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={busy}>
              {busy ? 'Joining…' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
