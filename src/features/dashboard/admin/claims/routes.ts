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
import { claimFormSchema } from "./schema";

export const adminClaimsDashboardRoutes = new Hono();

adminClaimsDashboardRoutes.get(
  "/",
  requireAdminAccess,
  getClaimsOverviewPageAdmin,
);
adminClaimsDashboardRoutes.post(
  "/:claimId/approve",
  paramValidator(claimIdSchema),
  formValidator(claimFormSchema),
  approveClaimAdmin,
);
adminClaimsDashboardRoutes.post(
  "/:claimId/reject",
  paramValidator(claimIdSchema),
  formValidator(claimFormSchema),
  rejectClaimAdmin,
);
