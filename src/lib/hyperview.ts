import { Context } from "hono";

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    /^192\.168\.\d+\.\d+$/.test(hostname) ||
    /^10\.\d+\.\d+\.\d+$/.test(hostname)
  );
}

function isInternalHostname(hostname: string): boolean {
  return isLocalHostname(hostname) || hostname.endsWith(".onrender.com");
}

function publicOriginFromRequest(c: Context): string | null {
  const forwardedHost = c.req.header("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = c.req.header("host")?.split(":")[0]?.trim();
  const hostname = forwardedHost?.split(":")[0] ?? hostHeader;
  if (!hostname || isInternalHostname(hostname)) return null;

  const proto = (c.req.header("x-forwarded-proto") ?? "https")
    .split(",")[0]
    ?.trim();
  return ensurePublicHttps(`${proto ?? "https"}://${hostname}`);
}

function ensurePublicHttps(origin: string): string {
  try {
    const url = new URL(origin);
    if (!isLocalHostname(url.hostname) && url.protocol === "http:") {
      url.protocol = "https:";
    }
    return url.origin;
  } catch {
    return origin.replace(/^http:\/\//i, "https://");
  }
}

/**
 * Public origin for absolute links and Hyperview `Image` URLs.
 * Uses `SITE_URL` in production, then `x-forwarded-*` when behind a reverse
 * proxy; otherwise the request URL origin (correct port in Vite dev).
 */
export const getBaseUrl = (c: Context) => {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  if (siteUrl && process.env.NODE_ENV === "production") {
    try {
      const requestHost = new URL(c.req.url).hostname;
      if (isLocalHostname(requestHost)) {
        return ensurePublicHttps(new URL(c.req.url).origin);
      }
    } catch {
      // fall through to SITE_URL
    }

    const requestOrigin = publicOriginFromRequest(c);
    if (requestOrigin) return requestOrigin;

    return siteUrl;
  }

  const requestOrigin = publicOriginFromRequest(c);
  if (requestOrigin) return requestOrigin;

  try {
    return ensurePublicHttps(new URL(c.req.url).origin);
  } catch {
    const proto = c.req.header("x-forwarded-proto") ?? "http";
    const host = c.req.header("host") ?? "localhost:3000";
    return ensurePublicHttps(`${proto}://${host}`);
  }
};
