import { io, type Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@online-uno/shared';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';

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
