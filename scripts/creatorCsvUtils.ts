export function slugFromProfileUrl(profileUrl?: string): string | null {
  if (!profileUrl) return null;
  try {
    const url = new URL(profileUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((part) => part === "creators");
    if (idx < 0) return null;
    return parts[idx + 1] ?? null;
  } catch {
    return null;
  }
}

const CONFIDENCE_RANK = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
} as const;

export function meetsMinConfidence(
  confidence: string | undefined,
  minConfidence: keyof typeof CONFIDENCE_RANK,
): boolean {
  const rank =
    CONFIDENCE_RANK[
      (confidence?.trim().toLowerCase() as keyof typeof CONFIDENCE_RANK) ??
        "none"
    ] ?? 0;
  return rank >= CONFIDENCE_RANK[minConfidence];
}
