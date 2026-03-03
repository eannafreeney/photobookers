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
  getBooksTableFilter,
  getEditBookPageAdmin,
  updateBookAdmin,
} from "./controllers";

export const adminBooksDashboardRoutes = new Hono();

adminBooksDashboardRoutes.use("*", async (c, next) => {
  console.log("Original method:", c.req.method);
  console.log("Headers:", Object.fromEntries(c.req.raw.headers));

  try {
    const body = await c.req.parseBody();
    console.log("Body:", body);
  } catch (e) {
    console.log("No parsable body");
  }

  await next();
});

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
adminBooksDashboardRoutes.get("/new", requireAdminAccess, getAddBookPageAdmin);
adminBooksDashboardRoutes.get(
  "/:bookId",
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
  "/:bookId",
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
