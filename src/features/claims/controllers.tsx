import Alert from "../../components/app/Alert";
import Modal from "../../components/app/Modal";
import { showErrorAlert, showSuccessAlert } from "../../lib/alertHelpers";
import { isSameDomain, normalizeUrl } from "../../services/verification";
import { getUser, setFlash } from "../../utils";
import { assignUserAsCreatorOwnerAdmin } from "../dashboard/admin/claims/services";
import { getCreatorById } from "../dashboard/creators/services";
import ClaimCreatorBtn from "./components/ClaimCreatorBtn";
import ClaimModal from "./modals/ClaimModal";
import { createClaimWithStatus } from "./services";
import {
  ClaimCompleteQueryContext,
  ClaimModalContext,
  ProcessClaimContext,
  RegisterAndClaimFormContext,
} from "./types";
import { emailMatchesWebsite } from "./utils";
import ClaimSignupModal from "./modals/ClaimSignUpModal";
import { verifyOtpForClaimSignup } from "../auth/services";
import { Context } from "hono";
import InfoPage from "../../pages/InfoPage";
import { createCreatorClaimedNotification } from "../dashboard/admin/notifications/utils";

export const getClaimModal = async (c: ClaimModalContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPath = c.req.valid("query").currentPath;
  const user = await getUser(c);
  const userId = user?.id;
  const [error, creator] = await getCreatorById(creatorId);
  if (error || !creator) {
    return showErrorAlert(c, "Creator not found");
  }

  if (!userId) {
    if (!creator) return showErrorAlert(c, "Creator Not Found");
    if (creator.status !== "stub")
      return showErrorAlert(c, "This profile is not available to claim.");

    return c.html(
      <>
        <Modal title="Claim this creator profile">
          <ClaimSignupModal
            creatorId={creatorId}
            creatorWebsite={creator.website ?? null}
            currentPath={currentPath}
          />
        </Modal>
        <ClaimCreatorBtn
          creator={creator}
          user={user}
          currentPath={currentPath}
        />
        <div id="toast"></div>
      </>,
      200,
    );
  }

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

// Process register + claim (sign up, then redirect to email verification; after verify, user hits GET /claims/complete)
export const processRegisterAndClaim = async (
  c: RegisterAndClaimFormContext,
) => {
  const creatorId = c.req.valid("param").creatorId;
  const formData = c.req.valid("form");

  const [error, creator] = await getCreatorById(creatorId);
  if (error || !creator) {
    return showErrorAlert(c, "Creator not found");
  }
  if (!creator) return showErrorAlert(c, "Creator not found");
  if (creator.status !== "stub")
    return showErrorAlert(c, "This profile is not available to claim.");

  const rawUrl = creator.website ?? formData.verificationUrl;
  if (!rawUrl)
    return showErrorAlert(
      c,
      "A website URL is required to claim this profile.",
    );

  const verificationUrl = normalizeUrl(rawUrl);

  const [verifyOtpError] = await verifyOtpForClaimSignup(
    c,
    formData,
    creatorId,
    verificationUrl,
  );
  if (verifyOtpError) return showErrorAlert(c, verifyOtpError.reason);

  return showSuccessAlert(
    c,
    "Your claim has been submitted. Please check your email for verification.",
  );
};

// After email verification, user is redirected here; create the claim then.
export const getClaimComplete = async (c: Context) => {
  const user = await getUser(c);
  if (!user)
    return c.redirect(
      `/auth/login?redirectUrl=${encodeURIComponent(c.req.url)}`,
    );

  const typed = c as unknown as ClaimCompleteQueryContext;
  const { creatorId, verificationUrl } = typed.req.valid("query");

  const [creatorError, creator] = await getCreatorById(creatorId);
  if (creatorError || !creator) {
    return c.html(
      <InfoPage
        errorMessage={creatorError?.reason ?? "Creator not found"}
        user={user}
      />,
      404,
    );
  }
  if (!creator) return showErrorAlert(c, "Creator not found");
  if (creator.status !== "stub")
    return c.html(
      <InfoPage
        errorMessage="This profile is not available to claim."
        user={user}
      />,
      403,
    );

  const normalizedUrl = normalizeUrl(verificationUrl);
  if (creator.website && !isSameDomain(normalizedUrl, creator.website))
    return c.html(
      <InfoPage
        errorMessage="Verification URL does not match creator website."
        user={user}
      />,
    );

  const domainMatches = emailMatchesWebsite(user.email, normalizedUrl);
  const status =
    domainMatches && creator.website ? "approved" : "pending_admin_review";

  const [createClaimError, creatorClaim] = await createClaimWithStatus(
    user.id,
    creatorId,
    normalizedUrl,
    status,
  );
  if (createClaimError || !creatorClaim)
    return c.html(
      <InfoPage
        errorMessage={createClaimError?.reason ?? "Failed to create claim"}
        user={user}
      />,
      400,
    );

  await createCreatorClaimedNotification(user, creator);

  if (status === "approved") {
    const [error] = await assignUserAsCreatorOwnerAdmin(
      user.id,
      creatorId,
      true,
    );
    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />, 400);
    }
    await setFlash(
      c,
      "success",
      "Your claim has been approved! Head to your dashboard to manage your profile.",
    );
    return c.redirect("/dashboard/books");
  }

  const [error] = await assignUserAsCreatorOwnerAdmin(user.id, creatorId);
  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />, 400);
  }
  return c.redirect("/dashboard/books");
};

export const processClaim = async (c: ProcessClaimContext) => {
  const formData = c.req.valid("form");
  const creatorId = c.req.valid("param").creatorId;
  const user = await getUser(c);

  const [creatorError, creator] = await getCreatorById(creatorId);
  if (creatorError || !creator) {
    return showErrorAlert(c, "Creator not found");
  }
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
