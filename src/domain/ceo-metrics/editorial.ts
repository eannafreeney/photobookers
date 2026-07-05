/** Editorial page path segments matched against book view / click referers. */
export const EDITORIAL_REFERER_PATHS = [
  "/featured",
  "/book-of-the-day",
  "/artist-of-the-week",
  "/publisher-of-the-week",
  "/this-week",
  "/interviews",
  "/newsletter",
] as const;

export function isEditorialReferer(referer: string | null | undefined): boolean {
  if (!referer?.trim()) return false;
  const lower = referer.toLowerCase();
  return EDITORIAL_REFERER_PATHS.some((path) => lower.includes(path));
}
