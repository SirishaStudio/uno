import { Link } from 'react-router-dom';

import { ROOM_CODE_LENGTH } from '@online-uno/shared';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';

export default function JoinRoomPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-12">
      <PageHeader
        title="Join room"
        subtitle={`Enter a ${ROOM_CODE_LENGTH}-character room code.`}
      />
      <label className="flex flex-col gap-2 text-sm text-uno-muted">
        Room code
        <input
          type="text"
          maxLength={ROOM_CODE_LENGTH}
          placeholder="ABC123"
          disabled
          className="rounded-xl border border-uno-border bg-uno-surface px-4 py-3 text-lg uppercase tracking-widest text-white placeholder:text-uno-muted/50"
        />
      </label>
      <Button className="mt-4 w-full" disabled>
        Join
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
