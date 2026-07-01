// src/index.ts
import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import "dotenv/config";

// Import your grouped routes
import { routes } from "./routes";
import NotFoundPage from "./pages/NotFoundPage";
import { getUser } from "./utils";

// import { enableEndpointSizeProfiler } from "./middleware/endpointSizeProfiler";

const app = new Hono();

// Global middleware
app.use("*", logger());

// if (process.env.NODE_ENV !== "production") {
//   app.use("*", enableEndpointSizeProfiler(60_000));
// }

app.get("/favicon.svg", serveStatic({ path: "./public/favicon.svg" }));
if (process.env.NODE_ENV === "production") {
  // Serve built CSS and JS at root level
  app.get("/styles.css", serveStatic({ path: "./dist/client/styles.css" }));
  app.get("/main.js", serveStatic({ path: "./dist/client/main.js" }));
  app.get("/dashboard.js", serveStatic({ path: "./dist/client/dashboard.js" }));
  app.get("/admin.js", serveStatic({ path: "./dist/client/admin.js" }));
  // Serve other assets (Vite `public/` → dist root, e.g. /icons for Hyperview PNGs)
  app.use("/assets/*", serveStatic({ root: "./dist/client" }));
  app.use("/icons/*", serveStatic({ root: "./dist/client" }));
}

// Mount your routes
app.route("/", routes);

// 404 route
app.notFound(async (c) => {
  const user = await getUser(c);
  return c.html(<NotFoundPage currentPath={c.req.path} user={user} />, 404);
});

// Export the Hono app (NO app.listen, NO manual server)
export default app;
