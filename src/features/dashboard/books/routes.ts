import { Hono } from "hono";
import {
  approveBook,
  createBookAsArtist,
  createBookAsPublisher,
  deleteBook,
  getAddBookPage,
  getBooksOverview,
  getEditBookPage,
  makeBookDraft,
  makeBookPublic,
  rejectBook,
  updateBookAsArtist,
  updateBookAsPublisher,
} from "./controllers";
import { bookFormSchema, bookIdSchema } from "../../../schemas";
import { limitBooksPerDay } from "../../../middleware/booksPerDayLimit";
import { formValidator, paramValidator } from "../../../lib/validator";
import {
  requireBookDeleteAccess,
  requireBookEditAccess,
  requireBookPublishAccess,
  requireBookUnpublishAccess,
} from "../../../middleware/bookGuard";

export const booksDashboardRoutes = new Hono();

// GET
booksDashboardRoutes.get("/", getBooksOverview);
booksDashboardRoutes.get("/new", getAddBookPage);
booksDashboardRoutes.get(
  "/edit/:bookId",
  paramValidator(bookIdSchema),
  getEditBookPage,
);
// POST
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
booksDashboardRoutes.post(
  "/edit/:bookId/publisher",
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  updateBookAsPublisher,
);
booksDashboardRoutes.post(
  "/edit/:bookId/artist",
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  updateBookAsArtist,
);
booksDashboardRoutes.post(
  "/delete/:bookId",
  paramValidator(bookIdSchema),
  requireBookDeleteAccess,
  deleteBook,
);
booksDashboardRoutes.post(
  "/:bookId/publish",
  requireBookPublishAccess,
  makeBookPublic,
);
booksDashboardRoutes.post(
  "/:bookId/unpublish",
  requireBookUnpublishAccess,
  makeBookDraft,
);
booksDashboardRoutes.post(
  "/:bookId/approve",
  paramValidator(bookIdSchema),
  approveBook,
);
booksDashboardRoutes.post(
  "/:bookId/reject",
  paramValidator(bookIdSchema),
  rejectBook,
);
