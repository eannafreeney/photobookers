import { Context } from "hono";

/**
 * Public origin for absolute links and Hyperview `Image` URLs.
 * Uses `x-forwarded-*` when behind a reverse proxy; otherwise the request URL
 * origin (correct port in Vite dev, e.g. :5173, and same host the Expo app used).
 */
export const getBaseUrl = (c: Context) => {
  const forwardedHost = c.req.header("x-forwarded-host");
  if (forwardedHost) {
    const proto = (c.req.header("x-forwarded-proto") ?? "https")
      .split(",")[0]
      ?.trim();
    const host = forwardedHost.split(",")[0]?.trim();
    return `${proto ?? "https"}://${host}`;
  }
  try {
    return new URL(c.req.url).origin;
  } catch {
    const proto = c.req.header("x-forwarded-proto") ?? "http";
    const host = c.req.header("host") ?? "localhost:3000";
    return `${proto}://${host}`;
  }
};
