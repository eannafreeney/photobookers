import { Hono } from "hono";
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
  updateFeaturedBooksAdmin,
} from "./controllers";
import { formValidator, queryValidator } from "../../../../lib/validator";
import {
  artistOfTheWeekFormSchema,
  bookOfTheWeekFormSchema,
  featuredBooksFormSchema,
  publisherOfTheWeekFormSchema,
  weekQuerySchema,
} from "./schema";

export const adminPlannerDashboardRoutes = new Hono();

// ---------- Pages (GET) ----------
adminPlannerDashboardRoutes.get("/", getPlannerPageAdmin);
adminPlannerDashboardRoutes.get(
  "/book-of-the-week/create",
  queryValidator(weekQuerySchema),
  getScheduleBOTWModal,
);
// ---------- Update (GET) ----------
adminPlannerDashboardRoutes.get(
  "/book-of-the-week/update",
  queryValidator(weekQuerySchema),
  getEditBOTWModalAdmin,
);
// ---------- Create (POST) ----------
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/create",
  formValidator(bookOfTheWeekFormSchema),
  setBOTWAdmin,
);
// ---------- Update (POST) ----------
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/update",
  formValidator(bookOfTheWeekFormSchema),
  updateBOTWAdmin,
);
// ---------- Delete ----------
adminPlannerDashboardRoutes.post(
  "/book-of-the-week/delete",
  queryValidator(weekQuerySchema),
  deleteBOTWAdmin,
);

// ---------- Featured (5) ----------
adminPlannerDashboardRoutes.get(
  "/featured/create",
  queryValidator(weekQuerySchema),
  getFeaturedModal,
);
adminPlannerDashboardRoutes.post(
  "/featured/create",
  formValidator(featuredBooksFormSchema),
  setFeaturedAdmin,
);
// ---------- Update (GET) ----------
adminPlannerDashboardRoutes.get(
  "/featured/update",
  queryValidator(weekQuerySchema),
  getEditFeaturedModal,
);
adminPlannerDashboardRoutes.post(
  "/featured/update",
  formValidator(featuredBooksFormSchema),
  updateFeaturedBooksAdmin,
);

// ---------- Artist of the week ----------
adminPlannerDashboardRoutes.get(
  "/artist-of-the-week/create",
  queryValidator(weekQuerySchema),
  getScheduleArtistModal,
);
adminPlannerDashboardRoutes.post(
  "/artist-of-the-week/create",
  formValidator(artistOfTheWeekFormSchema),
  setArtistOfTheWeekAdmin,
);
adminPlannerDashboardRoutes.get(
  "/artist-of-the-week/update",
  queryValidator(weekQuerySchema),
  getEditArtistModal,
);
adminPlannerDashboardRoutes.post(
  "/artist-of-the-week/update",
  formValidator(artistOfTheWeekFormSchema),
  updateArtistOfTheWeekAdmin,
);
adminPlannerDashboardRoutes.post(
  "/artist-of-the-week/delete",
  queryValidator(weekQuerySchema),
  deleteArtistOfTheWeek,
);
// ---------- Publisher of the week ----------
adminPlannerDashboardRoutes.get(
  "/publisher-of-the-week/create",
  queryValidator(weekQuerySchema),
  getSchedulePublisherModal,
);
adminPlannerDashboardRoutes.post(
  "/publisher-of-the-week/create",
  formValidator(publisherOfTheWeekFormSchema),
  setPublisherOfTheWeekAdmin,
);
adminPlannerDashboardRoutes.get(
  "/publisher-of-the-week/update",
  queryValidator(weekQuerySchema),
  getEditPublisherModal,
);
adminPlannerDashboardRoutes.post(
  "/publisher-of-the-week/update",
  formValidator(publisherOfTheWeekFormSchema),
  updatePublisherOfTheWeekAdmin,
);
adminPlannerDashboardRoutes.post(
  "/publisher-of-the-week/delete",
  queryValidator(weekQuerySchema),
  deletePublisherOfTheWeek,
);
