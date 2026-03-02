import { Hono } from "hono";
import { methodOverride } from "hono/method-override";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  createNewUserAdmin,
  deleteUserAdmin,
  generateMagicLinkAdmin,
  getUsersPageAdmin,
  sendMagicLinkAdmin,
} from "./controllers";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { magicLinkFormSchema, userIdSchema } from "../../../../schemas";
import { newUserFormAdminSchema } from "./schema";

export const adminUsersDashboardRoutes = new Hono();
adminUsersDashboardRoutes.use(
  "/users",
  methodOverride({ app: adminUsersDashboardRoutes }),
);
adminUsersDashboardRoutes.get("/users", requireAdminAccess, getUsersPageAdmin);
adminUsersDashboardRoutes.post(
  "/users/new",
  requireAdminAccess,
  formValidator(newUserFormAdminSchema),
  createNewUserAdmin,
);
adminUsersDashboardRoutes.delete(
  "/:userId",
  requireAdminAccess,
  paramValidator(userIdSchema),
  deleteUserAdmin,
);
adminUsersDashboardRoutes.get(
  "/generate-magic-link/:userId",
  requireAdminAccess,
  paramValidator(userIdSchema),
  generateMagicLinkAdmin,
);
adminUsersDashboardRoutes.post(
  "/:userId/send-magic-link",
  requireAdminAccess,
  formValidator(magicLinkFormSchema),
  paramValidator(userIdSchema),
  sendMagicLinkAdmin,
);
