import "dotenv/config";
import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";
import { useSession } from "@hono/session";
import { requireAdmin } from "../middleware/requireAdmin";
import { createRouter } from "hono-fsr";
import { manifest } from "../fs-routes.manifest";
import { methodOverride } from "hono/method-override";

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
routes.use("*", methodOverride({ app: routes, form: "_method" }));

await createRouter(routes, {
  manifest,
  basePath: "/",
  debug: process.env.NODE_ENV !== "production",
});
