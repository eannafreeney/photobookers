import { timingSafeEqual } from "node:crypto";
function requireCronSecret(c) {
  const expected = process.env.CRON_SECRET;
  const provided = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!expected || !provided || !safeEqual(provided, expected)) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return null;
}
function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
export {
  requireCronSecret
};
