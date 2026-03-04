import { Hono } from "hono";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  assignOwnerAdmin,
  createCreatorAdmin,
  deleteCreatorAdmin,
  getAssignOwnerModal,
  getAssignOwnerModalContent,
  getCreatorsOverviewPage,
  getCreatorsTableFilter,
  getEditCreatorPageAdmin,
  updateCreatorAdmin,
} from "./controllers";
import { creatorIdSchema } from "../../../../schemas";
import { creatorFormAdminSchema, manualAssignCreatorSchema } from "./schemas";
import { formValidator, paramValidator } from "../../../../lib/validator";

export const adminCreatorsDashboardRoutes = new Hono();

// ---------- Pages (GET) ----------
adminCreatorsDashboardRoutes.get(
  "/",
  requireAdminAccess,
  getCreatorsOverviewPage,
);
adminCreatorsDashboardRoutes.get(
  "/creators-table-filter",
  requireAdminAccess,
  getCreatorsTableFilter,
);

// ---------- Create (POST) ----------
adminCreatorsDashboardRoutes.post(
  "/create",
  requireAdminAccess,
  formValidator(creatorFormAdminSchema),
  createCreatorAdmin,
);

// ---------- Delete (POST) ----------
adminCreatorsDashboardRoutes.post(
  "/:creatorId/delete",
  paramValidator(creatorIdSchema),
  requireAdminAccess,
  deleteCreatorAdmin,
);

// ---------- Assign Owner (GET) ----------
adminCreatorsDashboardRoutes.get(
  "/assign-owner/:creatorId",
  requireAdminAccess,
  paramValidator(creatorIdSchema),
  getAssignOwnerModal,
);

adminCreatorsDashboardRoutes.get(
  "/assign-owner-content/:creatorId",
  requireAdminAccess,
  paramValidator(creatorIdSchema),
  getAssignOwnerModalContent,
);
adminCreatorsDashboardRoutes.post(
  "/assign-owner/:creatorId",
  requireAdminAccess,
  paramValidator(creatorIdSchema),
  formValidator(manualAssignCreatorSchema),
  assignOwnerAdmin,
);

// ---------- Edit (GET and POST) ----------
adminCreatorsDashboardRoutes.get(
  "/:creatorId/update",
  paramValidator(creatorIdSchema),
  requireAdminAccess,
  getEditCreatorPageAdmin,
);
adminCreatorsDashboardRoutes.post(
  "/:creatorId/update",
  requireAdminAccess,
  formValidator(creatorFormAdminSchema),
  paramValidator(creatorIdSchema),
  updateCreatorAdmin,
);
