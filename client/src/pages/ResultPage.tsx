import { Link, useParams } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';

export default function ResultPage() {
  const { code } = useParams<{ code: string }>();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-12">
      <PageHeader title="Results" subtitle={`Room ${code ?? '—'}`} />
      <Link to={ROUTES.home}>
        <span className="block text-center text-sm text-uno-yellow hover:underline">Back to lobby</span>
      </Link>
    </main>
  );
}
