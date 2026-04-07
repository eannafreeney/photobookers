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

// Apply optional auth to ALL routes (loads user if logged in)
routes.use("*", optionalAuthMiddleware);
routes.use("*", methodOverride({ app: routes, form: "_method" }));

await createRouter(routes, {
  manifest,
  basePath: "/",
  debug: true,
});

// Public routes
// routes.route("/", appRoutes);
// routes.route("/interviews", interviewRoutes);

// Protected routes (MUST be logged in)
// routes.use("/dashboard/*", requireAuth);
// routes.route("/dashboard/books", booksDashboardRoutes);
// routes.route("/dashboard/creators", creatorDashboardRoutes);
// routes.route("/dashboard/messages", messagesDashboardRoutes);
// routes.route("/dashboard/images", imageRoutes);
// routes.route("/claims", claimRoutes);

// API routes
// routes.route("/api", apiRoutes);

// Jobs routes
// routes.route("/jobs", jobsRoutes);

// Admin routes
// routes.use("/dashboard/admin/*", requireAdmin);
// routes.route("/dashboard/admin/books", adminBooksDashboardRoutes);
// routes.route("/dashboard/admin/users", adminUsersDashboardRoutes);
// routes.route("/dashboard/admin/claims", adminClaimsDashboardRoutes);
// routes.route("/dashboard/admin/creators", adminCreatorsDashboardRoutes);
// routes.route("/dashboard/admin/planner", adminPlannerDashboardRoutes);
// routes.route("/dashboard/admin/interviews", adminInterviewsDashboardRoutes);
// routes.route(
//   "/dashboard/admin/notifications",
//   adminNotificationsDashboardRoutes,
// );
