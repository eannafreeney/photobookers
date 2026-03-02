import { methodOverride } from "hono/method-override";
import { requireAdminAccess } from "../../../../middleware/adminGuard";
import { Hono } from "hono";
import {
  approveClaimAdmin,
  getClaimsOverviewPageAdmin,
  rejectClaimAdmin,
} from "./controllers";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { claimIdSchema } from "../../../../schemas";
import { claimApproveFormSchema, claimRejectFormSchema } from "./schema";

export const adminClaimsDashboardRoutes = new Hono();

adminClaimsDashboardRoutes.use(
  "/claims",
  methodOverride({ app: adminClaimsDashboardRoutes }),
);

adminClaimsDashboardRoutes.get(
  "/",
  requireAdminAccess,
  getClaimsOverviewPageAdmin,
);
adminClaimsDashboardRoutes.post(
  "/:claimId/approve",
  requireAdminAccess,
  paramValidator(claimIdSchema),
  formValidator(claimApproveFormSchema),
  approveClaimAdmin,
);
adminClaimsDashboardRoutes.delete(
  "/:claimId/reject",
  requireAdminAccess,
  paramValidator(claimIdSchema),
  formValidator(claimRejectFormSchema),
  rejectClaimAdmin,
);
