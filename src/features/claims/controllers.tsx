import Alert from "../../components/app/Alert";
import AuthModal from "../../components/app/AuthModal";
import Modal from "../../components/app/Modal";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers";
import { sendAdminEmail } from "../../lib/sendEmail";
import { supabaseAdmin } from "../../lib/supabase";
import { isSameDomain, normalizeUrl } from "../../services/verification";
import { getUser } from "../../utils";
import { assignUserAsCreatorOwnerAdmin } from "../dashboard/admin/claims/services";
import { getCreatorById } from "../dashboard/creators/services";
import ClaimCreatorBtn from "./components/ClaimCreatorBtn";
import { generateClaimNotificationEmail } from "./emails";
import ClaimModal from "./modals/ClaimModal";
import { createClaimWithStatus } from "./services";
import { ClaimModalContext, ProcessClaimContext } from "./types";
import { emailMatchesWebsite } from "./utils";

export const getClaimModal = async (c: ClaimModalContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPath = c.req.valid("query").currentPath;
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) {
    return c.html(
      <>
        {/* <div id="toast"></div> */}
        <AuthModal
          action="first to claim this creator."
          redirectUrl={currentPath}
          registerButtonUrl={`/auth/register?type=fan&redirectUrl=${currentPath}`}
        />
      </>,
      422,
    );
  }

  const creator = await getCreatorById(creatorId);

  if (!creator) return showErrorAlert(c, "Creator Not Found");

  return c.html(
    <>
      <Modal>
        <ClaimModal
          creatorId={creatorId}
          user={user}
          creatorWebsite={creator.website ?? ""}
        />
      </Modal>
      <ClaimCreatorBtn
        creator={creator}
        user={user}
        currentPath={currentPath}
      />
      <div id="toast"></div>
    </>,
  );
};

export const processClaim = async (c: ProcessClaimContext) => {
  const formData = c.req.valid("form");
  const creatorId = c.req.valid("param").creatorId;
  const user = await getUser(c);
  const creator = await getCreatorById(creatorId);
  if (!creator) return showErrorAlert(c, "Creator not found");
  // Use creator's existing website, or fall back to user-submitted URL
  const rawUrl = creator.website ?? formData.verificationUrl;
  if (!rawUrl)
    return showErrorAlert(
      c,
      "A website URL is required to claim this profile.",
    );
  const verificationUrl = normalizeUrl(rawUrl);
  // If creator has a listed website, enforce it — don't let user swap it
  if (creator.website && !isSameDomain(verificationUrl, creator.website)) {
    return showErrorAlert(
      c,
      `The URL must match the creator's listed website (${creator.website}).`,
    );
  }
  const domainMatches = emailMatchesWebsite(user.email, verificationUrl);
  const status =
    domainMatches && creator.website ? "approved" : "pending_admin_review";

  try {
    await createClaimWithStatus(user.id, creatorId, verificationUrl, status);
  } catch (error) {
    console.error("Error creating claim:", error);
    return showErrorAlert(c, "Failed to submit claim. Please try again.");
  }

  await sendAdminEmail(
    "New creator claim submitted",
    generateClaimNotificationEmail(),
  );

  if (status === "approved") {
    await assignUserAsCreatorOwnerAdmin(user.id, creatorId, true);
    // Optionally send a welcome email here
    return showSuccessAlert(
      c,
      "Your claim has been approved! Head to your dashboard to manage your profile.",
    );
  }
  // pending_admin_review
  // Optionally: notify admin via email/Slack here
  return c.html(
    <>
      <Alert
        type="info"
        message="Your claim has been submitted for review. We'll notify you once it's approved."
      />
      <ClaimCreatorBtn creator={creator} user={user} />
    </>,
  );
};
