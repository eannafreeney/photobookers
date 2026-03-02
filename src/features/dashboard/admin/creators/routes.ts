import { Hono } from "hono";
import { methodOverride } from "hono/method-override";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import {
  assignOwnerAdmin,
  createCreatorAdmin,
  deleteCreatorAdmin,
  getAssignOwnerModal,
  getAssignOwnerModalContent,
  getCreatorsPageAdmin,
  getEditCreatorPageAdmin,
  updateCreatorAdmin,
} from "./controllers";
import { creatorIdSchema } from "../../../../schemas";
import { creatorFormAdminSchema, manualAssignCreatorSchema } from "./schemas";
import { formValidator, paramValidator } from "../../../../lib/validator";

export const adminCreatorsDashboardRoutes = new Hono();

adminCreatorsDashboardRoutes.use(
  "/creators",
  methodOverride({ app: adminCreatorsDashboardRoutes }),
);

adminCreatorsDashboardRoutes.get("/", requireAdminAccess, getCreatorsPageAdmin);
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
  "/assign-owner",
  requireAdminAccess,
  getAssignOwnerModal,
);

adminCreatorsDashboardRoutes.get(
  "/assign-owner-content",
  requireAdminAccess,
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
  "/creators/edit/:creatorId/assign",
  requireAdminAccess,
  paramValidator(creatorIdSchema),
  formValidator(manualAssignCreatorSchema),
  assignOwnerAdmin,
);
