import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { bookIdSchema } from "../../../../schemas";
import { methodOverride } from "hono/method-override";
import {
  deleteBOTWAdmin,
  getBOTWModalAdmin,
  getEditBOTWModalAdmin,
  setBOTWAdmin,
  updateBOTWAdmin,
} from "./controllers";
import { bookOfTheWeekFormSchema } from "./schema";

export const adminBookOfTheWeekDashboardRoutes = new Hono();

adminBookOfTheWeekDashboardRoutes.get(
  "/:bookId",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  getBOTWModalAdmin,
);
adminBookOfTheWeekDashboardRoutes.get(
  "/:bookId/edit",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  getEditBOTWModalAdmin,
);
adminBookOfTheWeekDashboardRoutes.post(
  "/:bookId",
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  requireAdminAccess,
  setBOTWAdmin,
);

adminBookOfTheWeekDashboardRoutes.patch(
  "/:bookId",
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  requireAdminAccess,
  updateBOTWAdmin,
);
adminBookOfTheWeekDashboardRoutes.delete(
  "/:bookId",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  deleteBOTWAdmin,
);
