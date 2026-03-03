import { Hono } from "hono";
import { methodOverride } from "hono/method-override";
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
  updateBookAsArtist,
  updateBookAsPublisher,
} from "./controllers";
import {
  bookIdSchema,
  deleteBookFormSchema,
  publishToggleFormSchema,
} from "../../../schemas";
import { limitBooksPerDay } from "../../../middleware/booksPerDayLimit";
import { formValidator, paramValidator } from "../../../lib/validator";
import {
  requireBookDeleteAccess,
  requireBookEditAccess,
  requireBookPublishAccess,
  requireBookUnpublishAccess,
} from "../../../middleware/bookGuard";
import { bookFormAdminSchema } from "../admin/books/schema";

export const booksDashboardRoutes = new Hono();
booksDashboardRoutes.use(
  "/posts",
  methodOverride({ app: booksDashboardRoutes }),
);

// GET
booksDashboardRoutes.get("/", getBooksOverview);
booksDashboardRoutes.get("/new", getAddBookPage);
booksDashboardRoutes.get(
  "/edit/:bookId",
  paramValidator(bookIdSchema),
  getEditBookPage,
);
booksDashboardRoutes.post(
  "/new/publisher",
  limitBooksPerDay,
  formValidator(bookFormAdminSchema),
  createBookAsPublisher,
);
booksDashboardRoutes.post(
  "/new/artist",
  limitBooksPerDay,
  formValidator(bookFormAdminSchema),
  createBookAsArtist,
);
booksDashboardRoutes.post(
  "/edit/:bookId/publisher",
  paramValidator(bookIdSchema),
  formValidator(bookFormAdminSchema),
  requireBookEditAccess,
  updateBookAsPublisher,
);
booksDashboardRoutes.patch(
  "/edit/:bookId/artist",
  paramValidator(bookIdSchema),
  formValidator(bookFormAdminSchema),
  requireBookEditAccess,
  updateBookAsArtist,
);
booksDashboardRoutes.delete(
  "/delete/:bookId",
  paramValidator(bookIdSchema),
  formValidator(deleteBookFormSchema),
  requireBookDeleteAccess,
  deleteBook,
);
booksDashboardRoutes.patch(
  "/:bookId/publish",
  paramValidator(bookIdSchema),
  formValidator(publishToggleFormSchema),
  requireBookPublishAccess,
  makeBookPublic,
);
booksDashboardRoutes.patch(
  "/:bookId/unpublish",
  paramValidator(bookIdSchema),
  formValidator(publishToggleFormSchema),
  requireBookUnpublishAccess,
  makeBookDraft,
);
// booksDashboardRoutes.patch(
//   "/:bookId/approve",
//   paramValidator(bookIdSchema),
//   approveBook,
// );
// booksDashboardRoutes.patch(
//   "/:bookId/reject",
//   paramValidator(bookIdSchema),
//   rejectBook,
// );
