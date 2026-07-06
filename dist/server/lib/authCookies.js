function isLocalHostname(hostname) {
  const host = hostname.toLowerCase();
  return !host || host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.") || host.startsWith("10.") || host.endsWith(".local");
}
function getRequestHostname(c) {
  const host = c.req.header("host") ?? "";
  return host.split(":")[0] ?? "";
}
function getSiteHostname() {
  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
  try {
    return new URL(baseUrl).hostname;
  } catch {
    return "";
  }
}
function getCookieHostname(c) {
  if (c) {
    const requestHost = getRequestHostname(c);
    if (requestHost) return requestHost;
  }
  return getSiteHostname();
}
function getSharedCookieDomain(hostname) {
  const withoutWww = hostname.replace(/^www\./i, "");
  if (withoutWww === "photobookers.com") {
    return ".photobookers.com";
  }
  return void 0;
}
function getSharedCookieOptions(c) {
  const hostname = getCookieHostname(c);
  if (isLocalHostname(hostname)) {
    return { path: "/" };
  }
  const domain = getSharedCookieDomain(hostname);
  return domain ? { domain, path: "/", secure: true } : { path: "/", secure: true };
}
function getCookieClearOptions(c) {
  const { path, domain } = getSharedCookieOptions(c);
  return { path, domain };
}
export {
  getCookieClearOptions,
  getCookieHostname,
  getRequestHostname,
  getSharedCookieDomain,
  getSharedCookieOptions,
  isLocalHostname
};
