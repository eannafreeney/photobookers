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
import {
  ClaimModalContext,
  ProcessClaimContext,
  RegisterAndClaimFormContext,
} from "./types";
import { emailMatchesWebsite } from "./utils";
import { createSupabaseClient } from "../../lib/supabase"; // or wherever createSupabaseClient lives for auth
import ClaimSignUpModal from "./modals/ClaimSignUpModal";
import ClaimSignupModal from "./modals/ClaimSignUpModal";
import { Context } from "hono";

export const getClaimModal = async (c: ClaimModalContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPath = c.req.valid("query").currentPath;
  const user = await getUser(c);
  const userId = user?.id;
  const creator = await getCreatorById(creatorId);

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

  const creator = await getCreatorById(creatorId);
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
  if (creator.website && !isSameDomain(verificationUrl, creator.website))
    return showErrorAlert(
      c,
      `The URL must match the creator's listed website (${creator.website}).`,
    );

  const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
  const completeUrl = `/claims/complete?creatorId=${creatorId}&verificationUrl=${encodeURIComponent(verificationUrl)}`;
  const redirectUrl = `${baseUrl.replace(/\/$/, "")}/auth/callback?redirectUrl=${encodeURIComponent(completeUrl)}`;
  const emailRedirectTo = `${baseUrl.replace(/\/$/, "")}/auth/callback?redirectUrl=${encodeURIComponent(completeUrl)}`;

  const supabase = createSupabaseClient(c);
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo,
      data: {
        firstName: formData.firstName ?? null,
        lastName: formData.lastName ?? null,
      },
    },
  });

  const alreadyRegisteredMessage =
    "This email is already registered. Please log in.";
  if (error) {
    const isAlreadyRegistered =
      error.message?.toLowerCase().includes("already") ||
      error.message?.toLowerCase().includes("registered") ||
      error.code === "user_already_exists";
    return showErrorAlert(
      c,
      isAlreadyRegistered ? alreadyRegisteredMessage : error.message,
    );
  }
  if (data.user && (!data.user.identities || data.user.identities.length === 0))
    return showErrorAlert(c, alreadyRegisteredMessage);

  await sendAdminEmail(
    "New fan registered (claim intent)",
    generateClaimNotificationEmail(),
  );

  return c.redirect(
    `/auth/signup-success?name=${formData.firstName}&message=${encodeURIComponent("Check your email to verify your account and complete your claim.")}`,
  );
};

// After email verification, user is redirected here; create the claim then.
export const getClaimComplete = async (c: Context) => {
  const user = await getUser(c);
  if (!user)
    return c.redirect(
      `/auth/login?redirectUrl=${encodeURIComponent(c.req.url)}`,
    );
  const { creatorId, verificationUrl } = c.req.valid("query");
  const creator = await getCreatorById(creatorId);
  if (!creator) return showErrorAlert(c, "Creator not found");
  if (creator.status !== "stub")
    return showErrorAlert(c, "This profile is not available to claim.");
  const normalizedUrl = normalizeUrl(verificationUrl);
  if (creator.website && !isSameDomain(normalizedUrl, creator.website))
    return showErrorAlert(
      c,
      "Verification URL does not match creator website.",
    );

  const domainMatches = emailMatchesWebsite(user.email, normalizedUrl);
  const status =
    domainMatches && creator.website ? "approved" : "pending_admin_review";

  try {
    await createClaimWithStatus(user.id, creatorId, normalizedUrl, status);
  } catch (err) {
    console.error("Error creating claim:", err);
    return showErrorAlert(c, "Failed to submit claim. Please try again.");
  }
  await sendAdminEmail(
    "New creator claim submitted",
    generateClaimNotificationEmail(),
  );
  if (status === "approved") {
    await assignUserAsCreatorOwnerAdmin(user.id, creatorId, true);
    return showSuccessAlert(
      c,
      "Your claim has been approved! Head to your dashboard to manage your profile.",
    );
  }
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
