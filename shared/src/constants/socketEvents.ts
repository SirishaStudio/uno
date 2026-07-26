/** Socket event names — keep client and server in sync. */
export const SOCKET_EVENTS = {
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_REJOIN: 'room:rejoin',
  ROOM_LEAVE: 'room:leave',
  ROOM_READY: 'room:ready',
  ROOM_START: 'room:start',
  ROOM_KICK: 'room:kick',

  ROOM_STATE: 'room:state',
  ROOM_ERROR: 'room:error',
  ROOM_NOTIFICATION: 'room:notification',
  ROOM_STARTED: 'room:started',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
