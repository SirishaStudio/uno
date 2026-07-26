/** Safe digits for room codes (no 0, 1, 5). */
export const ROOM_CODE_DIGITS = ['2', '3', '4', '6', '7', '8', '9'] as const;

/** Five-letter words for readable codes (no O, I, S in words). */
export const ROOM_CODE_WORDS = [
  'PANDA',
  'RIVER',
  'MANGO',
  'TIGER',
  'LEMON',
  'GRAPE',
  'PEACH',
  'BERRY',
  'CAMEL',
  'EAGLE',
  'JUNGLE',
  'KITTEN',
  'LUNAR',
  'MAPLE',
  'NORTH',
  'ROCKET',
  'TULIP',
  'ULTRA',
  'VIVID',
  'ZEBRA',
  'CORAL',
  'FLAME',
  'GLADE',
  'HEART',
  'MAGIC',
  'PLANT',
  'RAVEN',
  'TANGO',
  'VAPOR',
  'WHEAT',
] as const;

export const ROOM_CODE_PATTERN = /^[A-Z]{5}[2346789]$/;

export const RECONNECT_TIMEOUT_MS = 60_000;
