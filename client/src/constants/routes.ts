export const ROUTES = {
  splash: '/splash',
  login: '/login',
  home: '/home',
  createRoom: '/create-room',
  joinRoom: '/join-room',
  waitingRoom: '/room/:code',
  game: '/game/:code',
  result: '/result/:code',
  profile: '/profile',
  settings: '/settings',
} as const;

export function waitingRoomPath(code: string) {
  return `/room/${code}`;
}

export function gamePath(code: string) {
  return `/game/${code}`;
}

export function resultPath(code: string) {
  return `/result/${code}`;
}
