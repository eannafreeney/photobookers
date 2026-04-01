import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  createNewUserAdmin,
  deleteMultipleUsersAdmin,
  deleteUserAdmin,
  getUserPageAdmin,
  getUsersPageAdmin,
} from "./controllers";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { userIdSchema } from "../../../../schemas";
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
adminUsersDashboardRoutes.get(
  "/:userId",
  requireAdminAccess,
  paramValidator(userIdSchema),
  getUserPageAdmin,
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
