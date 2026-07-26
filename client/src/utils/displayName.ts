const MIN_LENGTH = 2;
const MAX_LENGTH = 16;
const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;

export function validateDisplayName(raw: string): string | null {
  const name = raw.trim();
  if (name.length < MIN_LENGTH) {
    return `Name must be at least ${MIN_LENGTH} characters.`;
  }
  if (name.length > MAX_LENGTH) {
    return `Name must be at most ${MAX_LENGTH} characters.`;
  }
  if (!DISPLAY_NAME_PATTERN.test(name)) {
    return 'Use letters, numbers, spaces, hyphens, or underscores only.';
  }
  return null;
}

export function sanitizeDisplayName(raw: string): string {
  return raw.trim().slice(0, MAX_LENGTH);
}
