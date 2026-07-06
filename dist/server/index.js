import { jsx } from "hono/jsx/jsx-runtime";
import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { routes } from "./routes/index.js";
import NotFoundPage from "./pages/NotFoundPage.js";
import { getUser } from "./utils.js";
import { BUNDLE_CACHE, cachedStatic, IMMUTABLE_CACHE } from "./lib/staticCache.js";
const app = new Hono();
app.use("*", logger());
app.get(
  "/favicon.svg",
  cachedStatic({ path: "./public/favicon.svg", cacheControl: IMMUTABLE_CACHE })
);
if (process.env.NODE_ENV === "production") {
  app.get(
    "/styles.css",
    cachedStatic({
      path: "./dist/client/styles.css",
      cacheControl: BUNDLE_CACHE
    })
  );
  app.get(
    "/main.js",
    cachedStatic({ path: "./dist/client/main.js", cacheControl: BUNDLE_CACHE })
  );
  app.get(
    "/dashboard.js",
    cachedStatic({
      path: "./dist/client/dashboard.js",
      cacheControl: BUNDLE_CACHE
    })
  );
  app.get(
    "/admin.js",
    cachedStatic({ path: "./dist/client/admin.js", cacheControl: BUNDLE_CACHE })
  );
  app.use(
    "/assets/*",
    cachedStatic({ root: "./dist/client", cacheControl: IMMUTABLE_CACHE })
  );
  app.use(
    "/icons/*",
    cachedStatic({ root: "./dist/client", cacheControl: IMMUTABLE_CACHE })
  );
}
app.route("/", routes);
app.notFound(async (c) => {
  const user = await getUser(c);
  return c.html(/* @__PURE__ */ jsx(NotFoundPage, { currentPath: c.req.path, user }), 404);
});
var index_default = app;
export {
  index_default as default
};
