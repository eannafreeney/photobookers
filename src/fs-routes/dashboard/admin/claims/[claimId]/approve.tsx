import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import { claimIdSchema } from "../../../../../schemas";
import { claimFormSchema } from "../../../../../features/dashboard/admin/claims/schema";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import {
  approveClaim,
  getClaimById,
} from "../../../../../features/dashboard/admin/claims/services";
import { getUser } from "../../../../../utils";
import { getCreatorById } from "../../../../../features/dashboard/creators/services";
import { generateClaimApprovalEmail } from "../../../../../features/dashboard/admin/claims/emails";
import { sendEmail } from "../../../../../lib/sendEmail";
import Alert from "../../../../../components/app/Alert";
import ClaimsTableAdmin from "../../../../../features/dashboard/admin/claims/components/ClaimsTable";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const POST = createRoute(
  paramValidator(claimIdSchema),
  formValidator(claimFormSchema),
  async (c) => {
    const claimId = c.req.valid("param").claimId;
    if (!claimId) {
      return showErrorAlert(c, "Claim ID is required");
    }
    const claim = await getClaimById(claimId);
    if (!claim) {
      return showErrorAlert(c, "Claim not found");
    }
    const user = await getUser(c);
    const [error, creator] = await getCreatorById(claim.creatorId);
    if (error || !creator) {
      return showErrorAlert(c, "Creator not found");
    }
    if (!user || !creator) {
      return showErrorAlert(c, "User or creator not found");
    }

    await approveClaim(claimId);
    const emailHTML = await generateClaimApprovalEmail(user, creator);

    await sendEmail(
      user.email,
      `Your Claim for ${creator.displayName} has been approved`,
      emailHTML,
    );

    return c.html(
      <>
        <Alert type="success" message="Claim approved!" />
        <ClaimsTableAdmin />
        {dispatchEvents(["admin-claims:updated"])}
      </>,
    );
  },
);
