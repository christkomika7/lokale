export const MAX_REQUESTS = 100;
export const WINDOW_MS = 60;
export const BAN_DURATIONS: Record<number, number | null> = {
  1: 5 * 60 * 1000, // 1ère : 5 min
  2: 10 * 60 * 1000, // 2ème : 10 min
  3: 30 * 60 * 1000, // 3ème : 30 min
  4: 24 * 60 * 60 * 1000, // 4ème : 1 jour
  5: 30 * 24 * 60 * 60 * 1000, // 5ème : 1 mois
  6: null, // 6ème : permanent
};
export const blockedLogCache = new Map<string, number>();
export const BLOCKED_LOG_THROTTLE_MS = 5 * 60 * 1000;

export const rateLimitCache = new Map<
  string,
  { count: number; lastRequest: number }
>();
export const bannedIpCache = new Map<
  string,
  { banExpires: number | null; banReason: string | null }
>();
