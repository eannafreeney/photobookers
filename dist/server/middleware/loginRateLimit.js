import { createMiddleware } from "hono/factory";
import { LRUCache } from "lru-cache";
import { showErrorAlert } from "../lib/alertHelpers.js";
const WINDOW_MS = 15 * 60 * 1e3;
const MAX_ATTEMPTS = 10;
const attempts = new LRUCache({
  max: 1e4,
  ttl: WINDOW_MS
});
function clientIp(c) {
  const xff = c.req.header("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return c.req.header("x-real-ip")?.trim() || "unknown";
}
const keyFor = (c) => `login:${clientIp(c)}`;
const loginRateLimit = createMiddleware(async (c, next) => {
  const key = keyFor(c);
  const count = attempts.get(key) ?? 0;
  if (count >= MAX_ATTEMPTS) {
    return showErrorAlert(
      c,
      "Too many login attempts. Please wait a few minutes and try again.",
      429
    );
  }
  attempts.set(key, count + 1);
  await next();
});
function clearLoginAttempts(c) {
  attempts.delete(keyFor(c));
}
export {
  clearLoginAttempts,
  loginRateLimit
};
