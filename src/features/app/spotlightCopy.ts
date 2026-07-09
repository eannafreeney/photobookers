export function resolveSpotlightCopy(
  spotlightBlurb: string | null | undefined,
  fallback?: string | null,
): string | null {
  const copy = spotlightBlurb?.trim();
  if (copy) return copy;
  const fb = fallback?.trim();
  return fb || null;
}
