import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { claimIdSchema } from "../../../../../schemas/index.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import {
  approveClaim,
  getClaimById
} from "../../../../../features/dashboard/admin/claims/services.js";
import { getCreatorById } from "../../../../../features/dashboard/creators/services.js";
import { generateClaimApprovalEmail } from "../../../../../features/dashboard/admin/claims/emails.js";
import { sendEmail } from "../../../../../lib/sendEmail.js";
import Alert from "../../../../../components/app/Alert.js";
import ClaimsTableAdmin from "../../../../../features/dashboard/admin/claims/components/ClaimsTable.js";
import { dispatchEvents } from "../../../../../lib/disatchEvents.js";
import { getUserByIdBasic } from "../../../../../features/dashboard/admin/users/services.js";
import { isErr } from "../../../../../lib/result.js";
const POST = createRoute(paramValidator(claimIdSchema), async (c) => {
  const claimId = c.req.valid("param").claimId;
  const claim = await getClaimById(claimId);
  if (!claim) return showErrorAlert(c, "Claim not found");
  const [claimUserResult, creatorResult] = await Promise.all([
    getUserByIdBasic(claim.userId),
    getCreatorById(claim.creatorId)
  ]);
  if (isErr(claimUserResult))
    return showErrorAlert(c, claimUserResult[0].reason);
  if (isErr(creatorResult)) return showErrorAlert(c, creatorResult[0].reason);
  const claimUser = claimUserResult[1];
  const creator = creatorResult[1];
  const approveClaimResult = await approveClaim(claimId);
  if (isErr(approveClaimResult))
    return showErrorAlert(c, approveClaimResult[0].reason);
  const emailHTML = await generateClaimApprovalEmail(claimUser, creator);
  const sentEmailResult = await sendEmail(
    claimUser.email,
    `Your Claim for ${creator.displayName} has been approved`,
    emailHTML
  );
  if (isErr(sentEmailResult))
    return showErrorAlert(c, sentEmailResult[0].reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Claim approved!" }),
      /* @__PURE__ */ jsx(ClaimsTableAdmin, {}),
      dispatchEvents(["admin-claims:updated"])
    ] })
  );
});
export {
  POST
};
