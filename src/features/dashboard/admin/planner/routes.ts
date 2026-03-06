import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  deleteBOTWAdmin,
  getEditBOTWModalAdmin,
  getPlannerPageAdmin,
  getScheduleBOTWModal,
  getScheduleBOTWModalContent,
  setBOTWAdmin,
  updateBOTWAdmin,
} from "./controllers";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { bookIdSchema } from "../../../../schemas";
import { bookOfTheWeekFormSchema } from "./schema";

export const adminPlannerDashboardRoutes = new Hono();

// ---------- Pages (GET) ----------
adminPlannerDashboardRoutes.get("/", requireAdminAccess, getPlannerPageAdmin);
adminPlannerDashboardRoutes.get(
  "/book-of-the-week/create",
  requireAdminAccess,
  getScheduleBOTWModal,
);
adminPlannerDashboardRoutes.get(
  "/book-of-the-week/schedule-modal-content",
  requireAdminAccess,
  getScheduleBOTWModalContent,
);
adminPlannerDashboardRoutes.get(
  "/book-of-the-week/:bookId/update",
  requireAdminAccess,
  paramValidator(bookIdSchema),
  getEditBOTWModalAdmin,
);
// ---------- Create (POST) ----------
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/create",
  requireAdminAccess,
  formValidator(bookOfTheWeekFormSchema),
  setBOTWAdmin,
);
// ---------- Update (POST) ----------
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/update",
  requireAdminAccess,
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  updateBOTWAdmin,
);
// ---------- Delete ----------
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/:bookId/delete",
  requireAdminAccess,
  paramValidator(bookIdSchema),
  deleteBOTWAdmin,
);
