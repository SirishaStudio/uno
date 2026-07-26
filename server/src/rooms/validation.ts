import type { RoomPlayerPayload } from '@online-uno/shared';

const DISPLAY_NAME_MIN = 2;
const DISPLAY_NAME_MAX = 16;

export function validatePlayerPayload(payload: unknown): RoomPlayerPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const uid = typeof data.uid === 'string' ? data.uid.trim() : '';
  const displayName =
    typeof data.displayName === 'string' ? data.displayName.trim().slice(0, DISPLAY_NAME_MAX) : '';
  const photoURL =
    data.photoURL === null || data.photoURL === undefined
      ? null
      : typeof data.photoURL === 'string'
        ? data.photoURL
        : null;

  if (!uid || uid.length > 128) return null;
  if (displayName.length < DISPLAY_NAME_MIN) return null;
  return { uid, displayName, photoURL };
}

export function socketRoomName(code: string): string {
  return `room:${code}`;
}
