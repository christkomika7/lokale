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
