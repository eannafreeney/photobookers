import type { Context } from "hono";

export function requireCronSecret(c: Context) {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return null;
}
