import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import { bookFormSchema, bookIdSchema } from "../../../../schemas";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { methodOverride } from "hono/method-override";
import {
  createNewBookAdmin,
  getAddBookPageAdmin,
  getBooksOverviewPageAdmin,
  getBooksPageAdmin,
  getEditBookPageAdmin,
  updateBookAdmin,
} from "./controllers";

export const adminBooksDashboardRoutes = new Hono();

adminBooksDashboardRoutes.use(
  "/books",
  methodOverride({ app: adminBooksDashboardRoutes }),
);

adminBooksDashboardRoutes.get("/", requireAdminAccess, getBooksPageAdmin);
adminBooksDashboardRoutes.get(
  "/books",
  requireAdminAccess,
  getBooksOverviewPageAdmin,
);
adminBooksDashboardRoutes.get(
  "/books/new",
  requireAdminAccess,
  getAddBookPageAdmin,
);
adminBooksDashboardRoutes.get(
  "/books/edit/:bookId",
  requireAdminAccess,
  paramValidator(bookIdSchema),
  getEditBookPageAdmin,
);
adminBooksDashboardRoutes.post(
  "/books/new",
  requireAdminAccess,
  formValidator(bookFormSchema),
  createNewBookAdmin,
);
adminBooksDashboardRoutes.patch(
  "/books/edit/:bookId",
  requireAdminAccess,
  formValidator(bookFormSchema),
  paramValidator(bookIdSchema),
  updateBookAdmin,
);
