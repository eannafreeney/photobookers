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

export const getClaimsOverviewPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  return c.html(<ClaimsOverviewAdmin user={user} />);
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
  const creator = await getCreatorById(claim.creatorId);
  if (!user || !creator) {
    return showErrorAlert(c, "User or creator not found");
  }

  await approveClaim(claimId);
  const emailHTML = await generateClaimApprovalEmail(user, creator);

  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: user?.email,
        subject: `Your Claim for ${creator.displayName} has been approved`,
        html: emailHTML,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });

    if (error) {
      console.error("Failed to send email:", error);
      return showErrorAlert(
        c,
        "Failed to send approval email. Please try again.",
      );
    }
  } catch (error) {
    console.error("Email error:", error);
    return showErrorAlert(
      c,
      "Failed to send approval email. Please try again.",
    );
  }

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
  const creator = await getCreatorById(claim.creatorId);
  if (!user || !creator) {
    return showErrorAlert(c, "User or creator not found");
  }

  await rejectClaim(claimId);
  const emailHTML = await generateClaimRejectionEmail(user, creator);

  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: user?.email,
        subject: `Your Claim for ${creator.displayName} has been rejected`,
        html: emailHTML,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });

    if (error) {
      console.error("Failed to send email:", error);
      return showErrorAlert(
        c,
        "Failed to send rejection email. Please try again.",
      );
    }
  } catch (error) {
    console.error("Email error:", error);
    return showErrorAlert(
      c,
      "Failed to send rejection email. Please try again.",
    );
  }

  return c.html(
    <>
      <Alert type="success" message="Claim rejected!" />
      <ClaimsTableAdmin />
    </>,
  );
};
