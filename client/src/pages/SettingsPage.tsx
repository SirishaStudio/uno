import { Link } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/constants/routes';

export default function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-12">
      <PageHeader title="Settings" subtitle="Music, sound, and animations — Milestone 8." />
      <ul className="space-y-4 rounded-2xl border border-uno-border bg-uno-surface p-4 text-sm text-uno-muted">
        <li>Music — off</li>
        <li>Sound — on</li>
        <li>Animations — on</li>
      </ul>
      <Link
        to={ROUTES.home}
        className="mt-8 text-center text-sm text-uno-muted hover:text-white"
      >
        Back
      </Link>
    </main>
  );
}
