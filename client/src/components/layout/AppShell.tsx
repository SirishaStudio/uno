import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

/** Root layout wrapper — nav chrome added in later milestones. */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden">{children}</div>
  );
}
