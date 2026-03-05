import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  deleteBOTWAdmin,
  getBOTWModalAdmin,
  getEditBOTWModalAdmin,
  getPlannerPageAdmin,
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
  getBOTWModalAdmin,
);
adminPlannerDashboardRoutes.get(
  "/book-of-the-week/:bookId/update",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  getEditBOTWModalAdmin,
);
// ---------- Create (POST) ----------
// POST /:bookId/create
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/:bookId/create",
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  requireAdminAccess,
  setBOTWAdmin,
);
// ---------- Update (POST) ----------
// POST /:bookId/update
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/:bookId/update",
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  requireAdminAccess,
  updateBOTWAdmin,
);
// ---------- Delete ----------
// POST /:bookId/delete
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/:bookId/delete",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  deleteBOTWAdmin,
);
