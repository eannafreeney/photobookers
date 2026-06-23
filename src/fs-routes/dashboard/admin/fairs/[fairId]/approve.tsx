import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { fairIdSchema } from "../../../../../features/dashboard/admin/fairs/schema";
import { approveFair } from "../../../../../features/dashboard/admin/fairs/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { FairIdContext } from "../../../../../features/dashboard/admin/fairs/types";
import FairApprovalStatusPill from "../../../../../features/dashboard/admin/fairs/components/FairApprovalStatusPill";

export const POST = createRoute(
  paramValidator(fairIdSchema),
  async (c: FairIdContext) => {
    const fairId = c.req.valid("param").fairId;

    const [error, updatedFair] = await approveFair(fairId);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <div id="fair-approval-status" x-merge="morph">
        <FairApprovalStatusPill approvalStatus={updatedFair.approvalStatus} />
      </div>,
    );
  },
);
