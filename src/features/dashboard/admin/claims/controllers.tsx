import { Context } from "hono";
import { getUser } from "../../../../utils";
import ClaimsOverviewAdmin from "./pages/ClaimsOverviewAdmin";
import { approveClaim, getClaimById, rejectClaim } from "./services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import { supabaseAdmin } from "../../../../lib/supabase";
import Alert from "../../../../components/app/Alert";
import ClaimsTableAdmin from "./components/ClaimsTable";
import { ClaimIdContext } from "./types";
import { generateClaimApprovalEmail } from "./emails";
import { generateClaimRejectionEmail } from "../../../claims/emails";
import { getCreatorById } from "../../creators/services";
import { sendEmail } from "../../../../lib/sendEmail";

export const getClaimsOverviewPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(<ClaimsOverviewAdmin user={user} currentPath={currentPath} />);
};

export const approveClaimAdmin = async (c: ClaimIdContext) => {
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
    </>,
  );
};

export const rejectClaimAdmin = async (c: ClaimIdContext) => {
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
    </>,
  );
};
