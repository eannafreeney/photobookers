import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
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
import { getUserByIdBasic } from "../../../../../features/dashboard/admin/users/services";
import { isErr } from "../../../../../lib/result";

export const POST = createRoute(paramValidator(claimIdSchema), async (c) => {
  const claimId = c.req.valid("param").claimId;

  const claim = await getClaimById(claimId);
  if (!claim) return showErrorAlert(c, "Claim not found");

  const [claimUserResult, creatorResult] = await Promise.all([
    getUserByIdBasic(claim.userId),
    getCreatorById(claim.creatorId),
  ]);

  if (isErr(claimUserResult))
    return showErrorAlert(c, claimUserResult[0].reason);
  if (isErr(creatorResult)) return showErrorAlert(c, creatorResult[0].reason);

  const claimUser = claimUserResult[1];
  const creator = creatorResult[1];

  const rejectResult = await rejectClaim(claimId);
  if (isErr(rejectResult)) return showErrorAlert(c, rejectResult[0].reason);

  const emailHTML = await generateClaimRejectionEmail(claimUser, creator);

  const sentEmailResult = await sendEmail(
    claimUser.email,
    `Your Claim for ${creator.displayName} has been rejected`,
    emailHTML,
  );
  if (isErr(sentEmailResult))
    return showErrorAlert(c, sentEmailResult[0].reason);

  return c.html(
    <>
      <Alert type="success" message="Claim rejected!" />
      <ClaimsTableAdmin />
      {dispatchEvents(["admin-claims:updated"])}
    </>,
  );
});
