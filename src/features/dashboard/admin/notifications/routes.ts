import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  getNotificationsPageAdmin,
  getUnreadNotificationsCountAdmin,
  markAllNotificationsReadAdmin,
  markNotificationReadAdmin,
} from "./controllers";

export const adminNotificationsDashboardRoutes = new Hono();

adminNotificationsDashboardRoutes.get(
  "/",
  requireAdminAccess,
  getNotificationsPageAdmin,
);
adminNotificationsDashboardRoutes.post(
  "/read-all",
  requireAdminAccess,
  markAllNotificationsReadAdmin,
);
adminNotificationsDashboardRoutes.get(
  "/unread-count",
  requireAdminAccess,
  getUnreadNotificationsCountAdmin,
);
adminNotificationsDashboardRoutes.post(
  "/:notificationId/read",
  requireAdminAccess,
  markNotificationReadAdmin,
);
