import { Hono } from "hono";
import { methodOverride } from "hono/method-override";
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
adminCreatorsDashboardRoutes.post(
  "/new",
  requireAdminAccess,
  formValidator(creatorFormAdminSchema),
  createCreatorAdmin,
);
adminCreatorsDashboardRoutes.delete(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  requireAdminAccess,
  deleteCreatorAdmin,
);
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

adminCreatorsDashboardRoutes.get(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  requireAdminAccess,
  getEditCreatorPageAdmin,
);
adminCreatorsDashboardRoutes.patch(
  "/:creatorId",
  requireAdminAccess,
  formValidator(creatorFormAdminSchema),
  paramValidator(creatorIdSchema),
  updateCreatorAdmin,
);
adminCreatorsDashboardRoutes.post(
  "/assign-owner/:creatorId",
  requireAdminAccess,
  paramValidator(creatorIdSchema),
  formValidator(manualAssignCreatorSchema),
  assignOwnerAdmin,
);
