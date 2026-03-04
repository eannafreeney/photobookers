import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  createNewUserAdmin,
  deleteMultipleUsersAdmin,
  deleteUserAdmin,
  generateMagicLinkAdmin,
  getUsersPageAdmin,
  sendMagicLinkAdmin,
} from "./controllers";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { magicLinkFormSchema, userIdSchema } from "../../../../schemas";
import { deleteMultipleUsersSchema, newUserFormAdminSchema } from "./schema";

export const adminUsersDashboardRoutes = new Hono();

// ---------- Pages (GET) ----------
adminUsersDashboardRoutes.get("/", requireAdminAccess, getUsersPageAdmin);

// ---------- Create (POST) ----------
adminUsersDashboardRoutes.post(
  "/create",
  requireAdminAccess,
  formValidator(newUserFormAdminSchema),
  createNewUserAdmin,
);

// ---------- Delete (POST) ----------
adminUsersDashboardRoutes.post(
  "/:userId/delete",
  requireAdminAccess,
  paramValidator(userIdSchema),
  deleteUserAdmin,
);
adminUsersDashboardRoutes.post(
  "/delete-multiple",
  requireAdminAccess,
  formValidator(deleteMultipleUsersSchema),
  deleteMultipleUsersAdmin,
);
// ---------- Generate Magic Link (GET) ----------
adminUsersDashboardRoutes.get(
  "/:userId/generate-magic-link",
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
