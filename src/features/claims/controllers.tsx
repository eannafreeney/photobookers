import Alert from "../../components/app/Alert";
import AuthModal from "../../components/app/AuthModal";
import Modal from "../../components/app/Modal";
import { showErrorAlert } from "../../lib/alertHelpers";
import { supabaseAdmin } from "../../lib/supabase";
import ErrorPage from "../../pages/error/errorPage";
import { isSameDomain, normalizeUrl } from "../../services/verification";
import { getUser, setFlash } from "../../utils";
import { getCreatorById } from "../dashboard/creators/services";
import ClaimCreatorBtn from "./components/ClaimCreatorBtn";
import { generateClaimEmail } from "./emails";
import ClaimModal from "./modals/ClaimModal";
import ClaimVerificationFailurePage from "./pages/ClaimVerificationFailurePage";
import {
  createClaim,
  deleteClaim,
  getClaimByToken,
  verifyClaim,
} from "./services";
import {
  ClaimModalContext,
  ProcessClaimContext,
  VerifyClaimContext,
} from "./types";

export const getClaimModal = async (c: ClaimModalContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPath = c.req.valid("form").currentPath;
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) {
    return c.html(
      <>
        <div id="toast"></div>
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
  const userId = user.id;

  const creator = await getCreatorById(creatorId);
  if (!creator) return showErrorAlert(c, "Creator not found");

  // Normalize and validate URL
  const verificationUrl = normalizeUrl(formData.verificationUrl);
  const verificationMethod = formData.verificationMethod || "website";

  // Reject if the creator has a website listed, but is not same as the verification URL
  if (creator.website && !isSameDomain(verificationUrl, creator.website)) {
    return showErrorAlert(
      c,
      `The website URL is not the same as the creator's website (${creator.website}). Please try again.`,
    );
  }

  // Create claim
  let claim;
  try {
    claim = await createClaim(
      userId,
      creatorId,
      verificationUrl,
      verificationMethod,
    );
  } catch (error) {
    console.error("Error creating claim:", error);
    return showErrorAlert(c, "Failed to create claim. Please try again.");
  }

  // Send verification email
  const verificationLink = `${c.req.url.split("/claim")[0]}/claim/verify/${
    claim.verificationToken
  }`;

  const emailHtml = await generateClaimEmail(
    claim,
    creator,
    verificationUrl,
    verificationLink,
  );

  try {
    const { error } = await supabaseAdmin.functions.invoke("send-email", {
      body: {
        to: user.email,
        subject: `Verify Your Claim for ${creator.displayName}`,
        html: emailHtml,
      },
      headers: {
        "x-function-secret": process.env.FUNCTION_SECRET ?? "",
      },
    });

    if (error) {
      console.error("Failed to send email:", error);
      await deleteClaim(claim.id);
      return showErrorAlert(
        c,
        "Failed to send verification email. Please try again.",
      );
    }
  } catch (error) {
    console.error("Email error:", error);
    await deleteClaim(claim.id);
    return showErrorAlert(
      c,
      "Failed to send verification email. Please try again.",
    );
  }

  return c.html(
    <>
      <Alert
        type="success"
        message={`Verification email sent! Please check your inbox.`}
      />
      <ClaimCreatorBtn creator={creator} user={user} />
    </>,
  );
};

export const verifyClaimPage = async (c: VerifyClaimContext) => {
  const token = c.req.valid("param").token;
  const claim = await getClaimByToken(token);

  if (!claim) {
    return c.html(<ErrorPage errorMessage="Invalid verification link." />);
  }

  if (claim.status === "pending_admin_review") {
    const message =
      "Your claim has been verified and is pending admin approval. We’ll notify you when it’s reviewed.";
    return c.html(<ErrorPage errorMessage={message} />);
  }

  if (claim.status !== "pending") {
    const message =
      claim.status === "approved"
        ? "This claim has already been verified."
        : "This claim is no longer pending.";
    return c.html(<ErrorPage errorMessage={message} />);
  }

  // Attempt verification
  const result = await verifyClaim(claim);

  if (result.error && !result.verified) {
    return c.html(
      <ClaimVerificationFailurePage
        error={result.error}
        verificationCode={claim.verificationCode}
        verificationUrl={claim.verificationUrl}
      />,
    );
  }

  if (result.requiresApproval) {
    const currentUser = await getUser(c);
    // USER IS LOGGED IN
    if (currentUser?.id === claim.userId) {
      await setFlash(
        c,
        "success",
        "Your claim has been submitted for admin review. You will be notified via email when it is approved.",
      );
      return c.redirect("/dashboard/books");
    }

    await setFlash(
      c,
      "info",
      "Your claim has been submitted for admin review. In the meantime, you can login and start uploading books.",
    );
    return c.redirect(
      `/auth/login?redirectUrl=${encodeURIComponent("/dashboard/books")}`,
    );
  }

  setFlash(
    c,
    "success",
    "Verification successful. You can now start uploading books and editing your profile.",
  );
  return c.redirect("/dashboard/books");
};
