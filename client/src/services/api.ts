const baseUrl = import.meta.env.VITE_API_URL ?? '';

export async function fetchHealth(): Promise<{ ok: boolean; app: string }> {
  const res = await fetch(`${baseUrl}/health`);
  if (!res.ok) {
    throw new Error('Health check failed');
  }
  return res.json() as Promise<{ ok: boolean; app: string }>;
}
