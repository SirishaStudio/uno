import { io, type Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@online-uno/shared';

// Empty string means same-origin (works via Vite proxy in dev; direct in prod).
// A non-empty string is used as-is (e.g. https://api.example.com).
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string) ?? '';

let socket: Socket | null = null;

export function getGameSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectGameSocket(): Socket {
  const s = getGameSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectGameSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export { SOCKET_EVENTS };
