import "dotenv/config";
import { Hono } from "hono";
import { requireAuth } from "../middleware/requireAuth";
import { optionalAuthMiddleware } from "../middleware/optionalAuthMiddleware";
import { apiRoutes } from "./apiRoutes";
import { useSession } from "@hono/session";
import { claimRoutes } from "./claimRoutes";
import { imageRoutes } from "./imageRoutes";
import { adminDashboardRoutes } from "./adminDashboardRoutes";
import { requireAdmin } from "../middleware/requireAdmin";
import { appRoutes } from "../features/app/routes";
import { authRoutes } from "../features/auth/routes";
import { booksDashboardRoutes } from "../features/dashboard/books/routes";
import { creatorDashboardRoutes } from "../features/dashboard/creators/routes";
import { adminBooksDashboardRoutes } from "../features/dashboard/admin/books/routes";
import { adminUsersDashboardRoutes } from "../features/dashboard/admin/users/routes";

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

// Apply optional auth to ALL routes (loads user if logged in)
routes.use("*", optionalAuthMiddleware);

// Public routes
routes.route("/", appRoutes);
routes.route("/auth", authRoutes);

// Protected routes (MUST be logged in)
routes.use("/dashboard/*", requireAuth);
routes.route("/dashboard/books", booksDashboardRoutes);
routes.route("/dashboard/creators", creatorDashboardRoutes);
routes.route("/dashboard/images", imageRoutes);
routes.route("/claim", claimRoutes);

// API routes
routes.route("/api", apiRoutes);

// Admin routes
routes.use("/dashboard/admin/*", requireAdmin);
routes.route("/dashboard/admin", adminDashboardRoutes);
routes.route("/dashboard/admin/books", adminBooksDashboardRoutes);
routes.route("/dashboard/admin/users", adminUsersDashboardRoutes);
