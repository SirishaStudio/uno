import { Link, useParams } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';

export default function GamePage() {
  const { code } = useParams<{ code: string }>();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 pb-12">
      <PageHeader title="Game" subtitle={`Room ${code ?? '—'} · Engine in Milestone 4.`} />
      <Link to={ROUTES.home} className="text-center text-sm text-uno-muted hover:text-white">
        Exit (dev)
      </Link>
    </main>
  );
}
