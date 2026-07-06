function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local") || /^192\.168\.\d+\.\d+$/.test(hostname) || /^10\.\d+\.\d+\.\d+$/.test(hostname);
}
function isInternalHostname(hostname) {
  return isLocalHostname(hostname) || hostname.endsWith(".onrender.com");
}
function publicOriginFromRequest(c) {
  const forwardedHost = c.req.header("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = c.req.header("host")?.split(":")[0]?.trim();
  const hostname = forwardedHost?.split(":")[0] ?? hostHeader;
  if (!hostname || isInternalHostname(hostname)) return null;
  const proto = (c.req.header("x-forwarded-proto") ?? "https").split(",")[0]?.trim();
  return ensurePublicHttps(`${proto ?? "https"}://${hostname}`);
}
function ensurePublicHttps(origin) {
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
const getBaseUrl = (c) => {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
  if (siteUrl && process.env.NODE_ENV === "production") {
    try {
      const requestHost = new URL(c.req.url).hostname;
      if (isLocalHostname(requestHost)) {
        return ensurePublicHttps(new URL(c.req.url).origin);
      }
    } catch {
    }
    const requestOrigin2 = publicOriginFromRequest(c);
    if (requestOrigin2) return requestOrigin2;
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
export {
  getBaseUrl
};
