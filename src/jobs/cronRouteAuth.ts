import type { Context } from "hono";
import { timingSafeEqual } from "node:crypto";

/**
 * Guards cron/job HTTP routes. Requires `Authorization: Bearer <CRON_SECRET>`.
 *
 * The secret is read from the header only (never a query string), so it does
 * not leak into access logs, referrers, or proxy history. The comparison is
 * constant-time to avoid leaking the secret through response timing.
 */
export function requireCronSecret(c: Context) {
  const expected = process.env.CRON_SECRET;
  const provided = c.req
    .header("Authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (!expected || !provided || !safeEqual(provided, expected)) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return null;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch; the length check is not itself
  // constant-time, but the secret length is not sensitive.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
