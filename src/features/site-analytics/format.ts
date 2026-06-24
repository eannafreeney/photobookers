export function formatEngagementRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function formatGaDate(yyyymmdd: string): string {
  if (yyyymmdd.length === 8) {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
  }
  return yyyymmdd;
}
