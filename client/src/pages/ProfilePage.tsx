import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-uno-border py-3 last:border-0">
      <span className="text-sm text-uno-muted">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-12">
      <PageHeader title="Profile" subtitle="Your stats are saved to your account." />
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-uno-border bg-uno-surface p-6">
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt=""
            className="size-20 rounded-full border-2 border-uno-border object-cover"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-uno-bg text-2xl font-bold text-uno-yellow">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <p className="text-xl font-semibold">{profile.displayName}</p>
          <p className="text-sm text-uno-muted">{profile.isGuest ? 'Guest account' : 'Google account'}</p>
        </div>
        <div className="mt-2 w-full">
          <StatRow label="Games played" value={profile.gamesPlayed} />
          <StatRow label="Games won" value={profile.gamesWon} />
          <StatRow label="Win rate" value={`${profile.winPercentage.toFixed(1)}%`} />
          <StatRow label="Total score" value={profile.totalScore} />
        </div>
      </div>
      <Link to={ROUTES.home} className="mt-8 text-center">
        <Button variant="secondary">Back to lobby</Button>
      </Link>
    </main>
  );
}
