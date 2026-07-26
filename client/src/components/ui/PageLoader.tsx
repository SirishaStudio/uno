interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = 'Loading' }: PageLoaderProps) {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div
        className="size-10 animate-spin rounded-full border-2 border-uno-border border-t-uno-yellow"
        aria-hidden
      />
      <p className="text-sm text-uno-muted">{label}</p>
    </div>
  );
}
