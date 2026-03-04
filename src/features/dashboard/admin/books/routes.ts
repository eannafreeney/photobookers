import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import { bookIdSchema } from "../../../../schemas";
import { bookFormAdminSchema } from "./schema";
import { formValidator, paramValidator } from "../../../../lib/validator";
import {
  createNewBookAdmin,
  deleteBookAdmin,
  getAddBookPageAdmin,
  getBooksOverviewPageAdmin,
  getBooksTableFilter,
  getEditBookPageAdmin,
  updateBookAdmin,
} from "./controllers";

export const adminBooksDashboardRoutes = new Hono();

// ---------- Pages (GET) ----------
adminBooksDashboardRoutes.get(
  "/",
  requireAdminAccess,
  getBooksOverviewPageAdmin,
);
adminBooksDashboardRoutes.get(
  "/books-table-filter",
  requireAdminAccess,
  getBooksTableFilter,
);
adminBooksDashboardRoutes.get(
  "/create",
  requireAdminAccess,
  getAddBookPageAdmin,
);
adminBooksDashboardRoutes.get(
  "/:bookId/update",
  requireAdminAccess,
  paramValidator(bookIdSchema),
  getEditBookPageAdmin,
);

// ---------- Create (POST) ----------
adminBooksDashboardRoutes.post(
  "/create",
  requireAdminAccess,
  formValidator(bookFormAdminSchema),
  createNewBookAdmin,
);

// ---------- Update (POST) ----------
adminBooksDashboardRoutes.post(
  "/:bookId/update",
  requireAdminAccess,
  formValidator(bookFormAdminSchema),
  paramValidator(bookIdSchema),
  updateBookAdmin,
);

// ---------- Delete (POST) ----------
adminBooksDashboardRoutes.post(
  "/:bookId/delete",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  deleteBookAdmin,
);
