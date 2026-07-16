import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { LRUCache } from "lru-cache";
import { showErrorAlert } from "../lib/alertHelpers";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

// In-memory, per-instance throttle. Adequate for a single Node instance; if this
// ever runs multi-instance, move the counter to a shared store (Redis/Postgres).
const attempts = new LRUCache<string, number>({
  max: 10_000,
  ttl: WINDOW_MS,
});

function clientIp(c: Context): string {
  const xff = c.req.header("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return c.req.header("x-real-ip")?.trim() || "unknown";
}

const keyFor = (c: Context) => `login:${clientIp(c)}`;

/**
 * Throttles login attempts per client IP to slow brute-force / credential
 * stuffing. Failed and pending attempts count; a successful login clears the
 * counter via {@link clearLoginAttempts}.
 */
export const loginRateLimit = createMiddleware(async (c, next) => {
  const key = keyFor(c);
  const count = attempts.get(key) ?? 0;

  if (count >= MAX_ATTEMPTS) {
    return showErrorAlert(
      c,
      "Too many login attempts. Please wait a few minutes and try again.",
      429,
    );
  }

  attempts.set(key, count + 1);
  await next();
});

/** Reset the counter after a successful login so retries don't penalise users. */
export function clearLoginAttempts(c: Context) {
  attempts.delete(keyFor(c));
}
