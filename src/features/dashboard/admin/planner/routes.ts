import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  deleteBOTWAdmin,
  getEditBOTWModalAdmin,
  getFeaturedModal,
  getPlannerPageAdmin,
  getScheduleBOTWModal,
  setBOTWAdmin,
  setFeaturedAdmin,
  updateBOTWAdmin,
  getEditFeaturedModal,
  getScheduleArtistModal,
  setArtistOfTheWeekAdmin,
  getEditArtistModal,
  updateArtistOfTheWeekAdmin,
  getSchedulePublisherModal,
  setPublisherOfTheWeekAdmin,
  getEditPublisherModal,
  updatePublisherOfTheWeekAdmin,
  deletePublisherOfTheWeek,
  deleteArtistOfTheWeek,
} from "./controllers";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { bookIdSchema } from "../../../../schemas";
import {
  artistOfTheWeekFormSchema,
  bookOfTheWeekFormSchema,
  featuredBooksFormSchema,
  publisherOfTheWeekFormSchema,
} from "./schema";

export const adminPlannerDashboardRoutes = new Hono();

// ---------- Pages (GET) ----------
adminPlannerDashboardRoutes.get("/", requireAdminAccess, getPlannerPageAdmin);
adminPlannerDashboardRoutes.get(
  "/book-of-the-week/create",
  requireAdminAccess,
  getScheduleBOTWModal,
);
// ---------- Update (GET) ----------
adminPlannerDashboardRoutes.get(
  "/book-of-the-week/update",
  requireAdminAccess,
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

// ---------- Artist of the week ----------
adminPlannerDashboardRoutes.get(
  "/artist-of-the-week/create",
  requireAdminAccess,
  getScheduleArtistModal,
);
adminPlannerDashboardRoutes.post(
  "/artist-of-the-week/create",
  requireAdminAccess,
  formValidator(artistOfTheWeekFormSchema),
  setArtistOfTheWeekAdmin,
);
adminPlannerDashboardRoutes.get(
  "/artist-of-the-week/update",
  requireAdminAccess,
  getEditArtistModal,
);
adminPlannerDashboardRoutes.post(
  "/artist-of-the-week/update",
  requireAdminAccess,
  formValidator(artistOfTheWeekFormSchema),
  updateArtistOfTheWeekAdmin,
);
adminPlannerDashboardRoutes.post(
  "/artist-of-the-week/delete",
  requireAdminAccess,
  deleteArtistOfTheWeek,
);
// ---------- Publisher of the week ----------
adminPlannerDashboardRoutes.get(
  "/publisher-of-the-week/create",
  requireAdminAccess,
  getSchedulePublisherModal,
);
adminPlannerDashboardRoutes.post(
  "/publisher-of-the-week/create",
  requireAdminAccess,
  formValidator(publisherOfTheWeekFormSchema),
  setPublisherOfTheWeekAdmin,
);
adminPlannerDashboardRoutes.get(
  "/publisher-of-the-week/update",
  requireAdminAccess,
  getEditPublisherModal,
);
adminPlannerDashboardRoutes.post(
  "/publisher-of-the-week/update",
  requireAdminAccess,
  formValidator(publisherOfTheWeekFormSchema),
  updatePublisherOfTheWeekAdmin,
);
adminPlannerDashboardRoutes.post(
  "/publisher-of-the-week/delete",
  requireAdminAccess,
  deletePublisherOfTheWeek,
);
