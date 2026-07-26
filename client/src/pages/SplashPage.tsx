import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_NAME } from '@online-uno/shared';

import { PageLoader } from '@/components/ui/PageLoader';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = window.setTimeout(() => {
      navigate(user ? ROUTES.home : ROUTES.login, { replace: true });
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [loading, navigate, user]);

  if (loading) {
    return <PageLoader label="Starting…" />;
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
      <div
        className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-uno-red via-uno-yellow to-uno-green shadow-lg shadow-uno-red/20 will-change-transform"
        aria-hidden
      >
        <span className="text-3xl font-black tracking-tighter">UNO</span>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold">{APP_NAME}</p>
        <p className="mt-1 text-sm text-uno-muted">Official rules · Real-time multiplayer</p>
      </div>
    </main>
  );
}
