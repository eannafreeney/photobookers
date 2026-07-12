// src/index.ts
import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { routes } from "./routes";
import NotFoundPage from "./pages/NotFoundPage";
import { handleServerError } from "./lib/serverErrorResponse";
import { getUser } from "./utils";
import { BUNDLE_CACHE, cachedStatic, IMMUTABLE_CACHE } from "./lib/staticCache";

// import { enableEndpointSizeProfiler } from "./middleware/endpointSizeProfiler";

const app = new Hono();

// Global middleware
app.use("*", logger());

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

app.onError((err, c) => handleServerError(c, err));

// 404 route
app.notFound(async (c) => {
  const user = await getUser(c);
  return c.html(<NotFoundPage currentPath={c.req.path} user={user} />, 404);
});

// Export the Hono app (NO app.listen, NO manual server)
export default app;
