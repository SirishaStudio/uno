import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="mx-auto w-full max-w-lg px-4 pt-10 pb-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-uno-muted sm:text-base">{subtitle}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </header>
  );
}
