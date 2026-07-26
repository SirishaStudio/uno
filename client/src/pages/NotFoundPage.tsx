import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-4 pb-12">
      <PageHeader title="404" subtitle="This page does not exist." />
      <Link to={ROUTES.home}>
        <Button variant="secondary">Go home</Button>
      </Link>
    </main>
  );
}
