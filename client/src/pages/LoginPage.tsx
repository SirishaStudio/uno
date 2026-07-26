import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { GuestNameModal } from '@/components/auth/GuestNameModal';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, signInAsGuest, authError, clearAuthError, isConfigured, loading, user } =
    useAuth();
  const [busy, setBusy] = useState<'google' | 'guest' | null>(null);
  const [guestModalOpen, setGuestModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [loading, user, navigate]);

  const configMissing = Boolean(
    (location.state as { configMissing?: boolean } | null)?.configMissing,
  );

  const redirectAfterLogin = () => {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    navigate(from ?? ROUTES.home, { replace: true });
  };

  const onGoogle = async () => {
    clearAuthError();
    setBusy('google');
    try {
      await signInWithGoogle();
      redirectAfterLogin();
    } catch {
      /* error stored in context */
    } finally {
      setBusy(null);
    }
  };

  const onGuestSubmit = async (displayName: string) => {
    setBusy('guest');
    try {
      await signInAsGuest(displayName);
      setGuestModalOpen(false);
      redirectAfterLogin();
    } catch {
      /* error stored in context */
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-12">
      <PageHeader title="Sign in" subtitle="Play with Google or continue as a guest." />
      {!isConfigured || configMissing ? (
        <p className="mb-4 rounded-xl border border-uno-yellow/40 bg-uno-yellow/10 px-4 py-3 text-sm text-uno-yellow">
          Firebase is not configured. Add your keys to <code className="text-white">client/.env</code>{' '}
          and enable Google + Anonymous auth in the Firebase console.
        </p>
      ) : null}
      {authError ? (
        <p className="mb-4 text-sm text-uno-red" role="alert">
          {authError}
        </p>
      ) : null}
      <div className="flex flex-col gap-3">
        <Button
          className="w-full gap-2"
          disabled={!isConfigured || busy !== null}
          onClick={onGoogle}
        >
          {busy === 'google' ? 'Signing in…' : 'Continue with Google'}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          disabled={!isConfigured || busy !== null}
          onClick={() => setGuestModalOpen(true)}
        >
          Play as Guest
        </Button>
      </div>
      <GuestNameModal
        open={guestModalOpen}
        busy={busy === 'guest'}
        onClose={() => !busy && setGuestModalOpen(false)}
        onSubmit={onGuestSubmit}
      />
    </main>
  );
}
