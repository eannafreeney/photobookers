import "dotenv/config";
import { Hono } from "hono";
import { appRoutes } from "./appRoutes";
import { requireAuth, optionalAuthMiddleware } from "../middleware/auth";
import { authRoutes } from "./authRoutes";
import { booksDashboardRoutes } from "./booksDashboardRoutes";
import { creatorDashboardRoutes } from "./creatorDashboardRoutes";
import { claimDashboardRoutes } from "./claimDashboardRoutes";
import { apiRoutes } from "./apiRoutes";
import { useSession } from "@hono/session";
import { claimRoutes } from "./claimRoutes";

export const routes = new Hono();

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
      absolute: 60 * 60 * 24, // 24 hours
    },
  })
);

// Apply optional auth to ALL routes (loads user if logged in)
routes.use("*", optionalAuthMiddleware);

// Public routes
routes.route("/", appRoutes);
routes.route("/auth", authRoutes);

// Protected routes (MUST be logged in)
routes.use("/dashboard/*", requireAuth);
routes.route("/dashboard/books", booksDashboardRoutes);
routes.route("/dashboard/creators", creatorDashboardRoutes);
routes.route("/claim", claimRoutes);

// API routes
routes.route("/api", apiRoutes);
