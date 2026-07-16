// src/index.ts
import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";
import { routes } from "./routes";
import NotFoundPage from "./pages/NotFoundPage";
import { handleServerError } from "./lib/serverErrorResponse";
import { getUser } from "./utils";
import { BUNDLE_CACHE, cachedStatic, IMMUTABLE_CACHE } from "./lib/staticCache";

// import { enableEndpointSizeProfiler } from "./middleware/endpointSizeProfiler";

const app = new Hono();

// Global middleware
app.use("*", logger());
// Security headers: X-Frame-Options, X-Content-Type-Options: nosniff, HSTS, etc.
// CSP is intentionally left off for now — the app uses inline scripts (GA, JSON-LD)
// and would need a nonce/hash rollout before a restrictive policy can be enabled.
app.use("*", secureHeaders());

// if (process.env.NODE_ENV !== "production") {
//   app.use("*", enableEndpointSizeProfiler(60_000));
// }

app.get(
  "/favicon.svg",
  cachedStatic({ path: "./public/favicon.svg", cacheControl: IMMUTABLE_CACHE }),
);
if (process.env.NODE_ENV === "production") {
  app.get(
    "/styles.css",
    cachedStatic({
      path: "./dist/client/styles.css",
      cacheControl: BUNDLE_CACHE,
    }),
  );
  app.get(
    "/main.js",
    cachedStatic({ path: "./dist/client/main.js", cacheControl: BUNDLE_CACHE }),
  );
  app.get(
    "/dashboard.js",
    cachedStatic({
      path: "./dist/client/dashboard.js",
      cacheControl: BUNDLE_CACHE,
    }),
  );
  app.get(
    "/admin.js",
    cachedStatic({ path: "./dist/client/admin.js", cacheControl: BUNDLE_CACHE }),
  );
  app.use(
    "/assets/*",
    cachedStatic({ root: "./dist/client", cacheControl: IMMUTABLE_CACHE }),
  );
  app.use(
    "/icons/*",
    cachedStatic({ root: "./dist/client", cacheControl: IMMUTABLE_CACHE }),
  );
}

// Mount your routes
app.route("/", routes);

app.onError((err, c) => {
  // Intentional HTTP errors (e.g. CSRF 403 from hono/csrf) carry their own
  // response — pass it through instead of treating it as a 500 and paging admins.
  if (err instanceof HTTPException) return err.getResponse();
  return handleServerError(c, err);
});

// 404 route
app.notFound(async (c) => {
  const user = await getUser(c);
  return c.html(<NotFoundPage currentPath={c.req.path} user={user} />, 404);
});

// Export the Hono app (NO app.listen, NO manual server)
export default app;
