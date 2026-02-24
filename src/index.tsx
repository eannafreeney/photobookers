// src/index.ts
import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";

// Import your grouped routes
import { routes } from "./routes";

const app = new Hono();

// Global middleware
app.use("*", logger());

// Static assets (optional, only for Node runtime deployments)
// app.use("/styles/*", serveStatic({ root: "./src" }));

// In dev, serve from src/client, in prod serve from dist/client
// For now, let Vite handle /assets/* in dev mode via its dev server
// Only serve static in production
app.get("/favicon.svg", serveStatic({ path: "./public/favicon.svg" }));
if (process.env.NODE_ENV === "production") {
  // Serve built CSS and JS at root level
  app.get("/styles.css", serveStatic({ path: "./dist/client/styles.css" }));
  app.get("/main.js", serveStatic({ path: "./dist/client/main.js" }));
  // Serve other assets
  app.use("/assets/*", serveStatic({ root: "./dist/client" }));
}

// Mount your routes
app.route("/", routes);

// Export the Hono app (NO app.listen, NO manual server)
export default app;
