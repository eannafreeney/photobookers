/**
 * Normalizes URL to ensure consistent format
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add https:// if no protocol
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, "");

  return normalized;
}

export function getHostname(url: string): string {
  const normalized = normalizeUrl(url);
  try {
    const u = new URL(normalized);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    return host;
  } catch {
    return "";
  }
}

export function isSameDomain(urlA: string, urlB: string): boolean {
  return getHostname(urlA) === getHostname(urlB);
}
