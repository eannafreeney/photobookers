import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import { claimIdSchema } from "../../../../../schemas";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import {
  getClaimById,
  rejectClaim,
} from "../../../../../features/dashboard/admin/claims/services";
import { getUser } from "../../../../../utils";
import { getCreatorById } from "../../../../../features/dashboard/creators/services";
import { generateClaimRejectionEmail } from "../../../../../features/claims/emails";
import { sendEmail } from "../../../../../lib/sendEmail";
import Alert from "../../../../../components/app/Alert";
import ClaimsTableAdmin from "../../../../../features/dashboard/admin/claims/components/ClaimsTable";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const POST = createRoute(paramValidator(claimIdSchema), async (c) => {
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

  await rejectClaim(claimId);
  const emailHTML = await generateClaimRejectionEmail(user, creator);

  await sendEmail(
    user.email,
    `Your Claim for ${creator.displayName} has been rejected`,
    emailHTML,
  );

  return c.html(
    <>
      <Alert type="success" message="Claim rejected!" />
      <ClaimsTableAdmin />
      {dispatchEvents(["admin-claims:updated"])}
    </>,
  );
});
