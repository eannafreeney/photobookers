import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import { bookIdSchema } from "../../../../schemas";
import { bookFormAdminSchema } from "./schema";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { methodOverride } from "hono/method-override";
import {
  createNewBookAdmin,
  deleteBookAdmin,
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
  "/",
  requireAdminAccess,
  getBooksOverviewPageAdmin,
);
adminBooksDashboardRoutes.get("/new", requireAdminAccess, getAddBookPageAdmin);
adminBooksDashboardRoutes.get(
  "/edit/:bookId",
  requireAdminAccess,
  paramValidator(bookIdSchema),
  getEditBookPageAdmin,
);
adminBooksDashboardRoutes.post(
  "/new",
  requireAdminAccess,
  formValidator(bookFormAdminSchema),
  createNewBookAdmin,
);
adminBooksDashboardRoutes.patch(
  "/edit/:bookId",
  requireAdminAccess,
  formValidator(bookFormAdminSchema),
  paramValidator(bookIdSchema),
  updateBookAdmin,
);
adminBooksDashboardRoutes.delete(
  "/:bookId",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  deleteBookAdmin,
);
