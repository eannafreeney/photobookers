import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import { getInterviewsPageAdmin } from "./controllers";

export const adminInterviewsDashboardRoutes = new Hono();

adminInterviewsDashboardRoutes.get(
  "/",
  requireAdminAccess,
  getInterviewsPageAdmin,
);
