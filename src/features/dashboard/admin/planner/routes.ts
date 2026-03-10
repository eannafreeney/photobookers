import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  deleteBOTWAdmin,
  getEditBOTWModalAdmin,
  getFeaturedModalContent,
  getFeaturedModal,
  getPlannerPageAdmin,
  getScheduleBOTWModal,
  getScheduleBOTWModalContent,
  setBOTWAdmin,
  setFeaturedAdmin,
  updateBOTWAdmin,
  getEditFeaturedModal,
} from "./controllers";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { bookIdSchema } from "../../../../schemas";
import { bookOfTheWeekFormSchema, featuredBooksFormSchema } from "./schema";

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

// ---------- Featured (5) ----------
adminPlannerDashboardRoutes.get(
  "/featured/create",
  requireAdminAccess,
  getFeaturedModal,
);
adminPlannerDashboardRoutes.get(
  "/featured/featured-modal-content",
  requireAdminAccess,
  getFeaturedModalContent,
);
adminPlannerDashboardRoutes.post(
  "/featured/create",
  requireAdminAccess,
  formValidator(featuredBooksFormSchema),
  setFeaturedAdmin,
);
// ---------- Update (GET) ----------
adminPlannerDashboardRoutes.get(
  "/featured/update",
  requireAdminAccess,
  getEditFeaturedModal,
);
adminPlannerDashboardRoutes.post(
  "/featured/update",
  requireAdminAccess,
  formValidator(featuredBooksFormSchema),
  // updateFeaturedAdmin,
);
