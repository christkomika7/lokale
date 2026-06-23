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
