import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/constants/routes';

export default function HomePage() {
  const { profile, signOut } = useAuth();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-12">
      <PageHeader
        title="Lobby"
        subtitle={
          profile
            ? `Welcome, ${profile.displayName}${profile.isGuest ? ' (guest)' : ''}`
            : 'Create or join a room to start playing.'
        }
      />
      <nav className="flex flex-col gap-3" aria-label="Main actions">
        <Link to={ROUTES.createRoom}>
          <Button className="w-full">Create Room</Button>
        </Link>
        <Link to={ROUTES.joinRoom}>
          <Button variant="secondary" className="w-full">
            Join Room
          </Button>
        </Link>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to={ROUTES.profile}>
            <Button variant="ghost" className="w-full">
              Profile
            </Button>
          </Link>
          <Link to={ROUTES.settings}>
            <Button variant="ghost" className="w-full">
              Settings
            </Button>
          </Link>
        </div>
        <Button variant="ghost" className="mt-4 w-full text-uno-muted" onClick={() => signOut()}>
          Sign out
        </Button>
      </nav>
    </main>
  );
}
