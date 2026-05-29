import type { Context } from "hono";

export function isLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.endsWith(".local")
  );
}

export function getRequestHostname(c: Context): string {
  const host = c.req.header("host") ?? "";
  return host.split(":")[0] ?? "";
}

function getSiteHostname(): string {
  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
  try {
    return new URL(baseUrl).hostname;
  } catch {
    return "";
  }
}

/** Hostname used for cookie domain/secure flags — request wins over SITE_URL. */
export function getCookieHostname(c?: Context): string {
  if (c) {
    const requestHost = getRequestHostname(c);
    if (requestHost) return requestHost;
  }
  return getSiteHostname();
}

export function getSharedCookieOptions(c?: Context): {
  path: "/";
  domain?: string;
  secure?: boolean;
} {
  const hostname = getCookieHostname(c);
  if (isLocalHostname(hostname)) {
    return { path: "/" };
  }
  const rootDomain = hostname.replace(/^www\./i, "");
  return { domain: `.${rootDomain}`, path: "/", secure: true };
}
