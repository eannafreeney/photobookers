import "dotenv/config";
import { Hono } from "hono";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware.js";
import { useSession } from "@hono/session";
import { createRouter } from "hono-fsr";
import { manifest } from "../fs-routes.manifest.js";
import { methodOverride } from "hono/method-override";
const routes = new Hono();
const sessionSecret = process.env.AUTH_SECRET;
if (!sessionSecret) {
  throw new Error(
    "AUTH_SECRET environment variable is not set. Please check your .env file."
  );
}
routes.use(
  "*",
  useSession({
    secret: sessionSecret,
    duration: {
      absolute: 60 * 60 * 24
      // 24 hours
    }
  })
);
routes.use("*", optionalAuthMiddleware);
routes.use("*", methodOverride({ app: routes, form: "_method" }));
await createRouter(routes, {
  manifest,
  basePath: "/",
  debug: process.env.NODE_ENV !== "production"
});
export {
  routes
};
