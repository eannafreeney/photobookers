const DEFAULT_FALLBACK = "/";

/**
 * Returns a same-origin path+query for redirects after login/reset. Rejects
 * open redirects (e.g. https://evil.com) and protocol-relative URLs.
 */
export function safeAppRedirect(
  value: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (value == null || value === "" || value === "undefined") {
    return fallback;
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  const base = (process.env.SITE_URL ?? "http://localhost:5173").replace(
    /\/$/,
    "",
  );
  try {
    const parsed = new URL(trimmed, base);
    const baseUrl = new URL(base);
    if (parsed.origin === baseUrl.origin) {
      return parsed.pathname + parsed.search;
    }
  } catch {
    // ignore
  }
  return fallback;
}
