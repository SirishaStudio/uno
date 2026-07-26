import { Link, useParams } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';

export default function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-12">
      <PageHeader
        title="Waiting room"
        subtitle={`Room ${code ?? '—'} · Ready status coming in Milestone 3.`}
      />
      <Link to={ROUTES.home} className="text-center text-sm text-uno-muted hover:text-white">
        Leave
      </Link>
    </main>
  );
}
