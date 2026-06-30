import { BAN_DURATIONS } from "../config/auth/rate-limiter";

export function getBanDuration(violations: number): number | null {
  return BAN_DURATIONS[violations] ?? null;
}

export function formatBanDuration(violations: number): string {
  const labels: Record<number, string> = {
    1: "5 minutes",
    2: "10 minutes",
    3: "30 minutes",
    4: "1 jour",
    5: "1 mois",
    6: "définitivement",
  };
  return labels[violations] ?? "définitivement";
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getRemainingSeconds(banExpires: string | Date) {
  const expiresAt = new Date(banExpires).getTime();
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

export function formatRemaining(banExpires: string) {
  const diff = Math.max(
    0,
    Math.ceil((new Date(banExpires).getTime() - Date.now()) / 1000),
  );
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(value: string, withTime = false) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
}

export function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;

  const diffJ = Math.floor(diffH / 24);
  return `Il y a ${diffJ}j`;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
