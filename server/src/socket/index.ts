import type { Server } from 'socket.io';

import { registerRoomHandlers } from './roomHandlers.js';

export function registerSocketHandlers(io: Server): void {
  registerRoomHandlers(io);
}
