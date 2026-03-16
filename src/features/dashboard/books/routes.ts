import { Hono } from "hono";
import {
  createBookAsArtist,
  createBookAsPublisher,
  deleteBook,
  getAddBookPage,
  getBooksOverview,
  getEditBookPage,
  makeBookDraft,
  makeBookPublic,
  updateBookDetails,
} from "./controllers";
import { bookIdSchema } from "../../../schemas";
import { limitBooksPerDay } from "../../../middleware/booksPerDayLimit";
import { formValidator, paramValidator } from "../../../lib/validator";
import {
  requireBookDeleteAccess,
  requireBookEditAccess,
  requireBookPublishAccess,
  requireBookUnpublishAccess,
} from "../../../middleware/bookGuard";
import { bookFormSchema } from "./schema";

export const booksDashboardRoutes = new Hono();

// ---------- Pages (GET) ----------
booksDashboardRoutes.get("/", getBooksOverview);
booksDashboardRoutes.get("/new", getAddBookPage);
booksDashboardRoutes.get(
  "/:bookId/update",
  paramValidator(bookIdSchema),
  requireBookEditAccess,
  getEditBookPage,
);

// ---------- Create (POST) ----------
booksDashboardRoutes.post(
  "/new/publisher",
  limitBooksPerDay,
  formValidator(bookFormSchema),
  createBookAsPublisher,
);
booksDashboardRoutes.post(
  "/new/artist",
  limitBooksPerDay,
  formValidator(bookFormSchema),
  createBookAsArtist,
);

// ---------- Update (POST) ----------
booksDashboardRoutes.post(
  "/:bookId/update/publisher",
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  updateBookDetails,
);
booksDashboardRoutes.post(
  "/:bookId/update/artist",
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  updateBookDetails,
);

// ---------- Delete (POST) ----------
booksDashboardRoutes.post(
  "/:bookId/delete",
  paramValidator(bookIdSchema),
  requireBookDeleteAccess,
  deleteBook,
);

// ---------- Publish / Unpublish (POST) ----------
booksDashboardRoutes.post(
  "/:bookId/publish",
  paramValidator(bookIdSchema),
  requireBookPublishAccess,
  makeBookPublic,
);
booksDashboardRoutes.post(
  "/:bookId/unpublish",
  paramValidator(bookIdSchema),
  requireBookUnpublishAccess,
  makeBookDraft,
);
