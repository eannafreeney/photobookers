import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { bookIdSchema } from "../../../../schemas";
import {
  deleteBOTWAdmin,
  getBOTWModalAdmin,
  getEditBOTWModalAdmin,
  setBOTWAdmin,
  updateBOTWAdmin,
} from "./controllers";
import { bookOfTheWeekFormSchema } from "./schema";

export const adminBookOfTheWeekDashboardRoutes = new Hono();

// ---------- Modals (GET) ----------
// GET /:bookId/create, GET /:bookId/update

adminBookOfTheWeekDashboardRoutes.get(
  "/:bookId/create",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  getBOTWModalAdmin,
);
adminBookOfTheWeekDashboardRoutes.get(
  "/:bookId/update",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  getEditBOTWModalAdmin,
);
// ---------- Create (POST) ----------
// POST /:bookId/create
adminBookOfTheWeekDashboardRoutes.post(
  "/:bookId/create",
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  requireAdminAccess,
  setBOTWAdmin,
);
// ---------- Update (POST) ----------
// POST /:bookId/update
adminBookOfTheWeekDashboardRoutes.post(
  "/:bookId/update",
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  requireAdminAccess,
  updateBOTWAdmin,
);
// ---------- Delete ----------
// POST /:bookId/delete
adminBookOfTheWeekDashboardRoutes.post(
  "/:bookId/delete",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  deleteBOTWAdmin,
);
