import "dotenv/config";
import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";
import { useSession } from "@hono/session";
import { requireAdmin } from "../middleware/requireAdmin";
import { createRouter } from "hono-fsr";
import { manifest } from "../fs-routes.manifest";
import { methodOverride } from "hono/method-override";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import type { Context, Next } from "hono";

export const routes = new Hono();

const sessionSecret = process.env.AUTH_SECRET;
if (!sessionSecret) {
  throw new Error(
    "AUTH_SECRET environment variable is not set. Please check your .env file.",
  );
}

routes.use(
  "*",
  useSession({
    secret: sessionSecret,
    duration: {
      absolute: 60 * 60 * 24, // 24 hours
    },
  }),
);

routes.use("*", optionalAuthMiddleware);

// CSRF protection for browser (cookie-authenticated) form submissions. Accepts
// requests whose Origin host matches the request Host; Hono also allows
// `Sec-Fetch-Site: same-origin`. Only challenges non-GET requests with a
// form-style content-type, so JSON/API calls are unaffected.
//
// Scoped to browser routes: mobile Hyperview and cron jobs POST form bodies
// without a browser Origin (they authenticate via Bearer tokens / cron secret),
// so `/hyperview`, `/jobs`, and `/api` are excluded to avoid blocking them.
const csrfProtection = csrf({
  origin: (origin, c) => {
    const host = c.req.header("host");
    if (!host) return false;
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  },
});

const CSRF_EXEMPT_PREFIXES = ["/hyperview", "/jobs", "/api"];
routes.use("*", (c: Context, next: Next) => {
  const path = c.req.path;
  if (CSRF_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return next();
  }
  return csrfProtection(c, next);
});

routes.use("*", methodOverride({ app: routes, form: "_method" }));

await createRouter(routes, {
  manifest,
  basePath: "/",
  debug: process.env.NODE_ENV !== "production",
});
