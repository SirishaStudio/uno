const ACTIVE_ROOM_KEY = 'online_uno_active_room';

export function getStoredRoomCode(): string | null {
  return sessionStorage.getItem(ACTIVE_ROOM_KEY);
}

export function setStoredRoomCode(code: string): void {
  sessionStorage.setItem(ACTIVE_ROOM_KEY, code);
}

export function clearStoredRoomCode(): void {
  sessionStorage.removeItem(ACTIVE_ROOM_KEY);
}

export function buildInviteLink(code: string): string {
  const origin = window.location.origin.replace(/\/$/, '');
  return `${origin}/join-room?code=${encodeURIComponent(code)}`;
}
