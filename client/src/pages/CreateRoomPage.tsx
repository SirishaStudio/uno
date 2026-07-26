import { Link } from 'react-router-dom';

import { MAX_PLAYERS, MIN_PLAYERS } from '@online-uno/shared';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';

export default function CreateRoomPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-12">
      <PageHeader
        title="Create room"
        subtitle={`${MIN_PLAYERS}–${MAX_PLAYERS} players · Room flow in Milestone 3.`}
      />
      <Button className="w-full" disabled>
        Generate room
      </Button>
      <Link
        to={ROUTES.home}
        className="mt-8 text-center text-sm text-uno-muted hover:text-white"
      >
        Back
      </Link>
    </main>
  );
}
