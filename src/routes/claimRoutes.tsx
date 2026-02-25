import { Hono } from "hono";
import { getUser, setFlash } from "../utils";
import AuthModal from "../components/app/AuthModal";
import { getCreatorById } from "../services/creators";
import Alert from "../components/app/Alert";
import Modal from "../components/app/Modal";
import ClaimCreatorBtn from "../components/claims/ClaimCreatorBtn";
import { formValidator, paramValidator } from "../lib/validator";
import { claimFormSchema, creatorIdSchema } from "../schemas";
import { isSameDomain, normalizeUrl } from "../services/verification";
import {
  createClaim,
  generateClaimEmail,
  getClaimByToken,
  verifyClaim,
  deleteClaim,
} from "../services/claims";
import { supabaseAdmin } from "../lib/supabase";
import ClaimModal from "../components/claims/ClaimModal";
import { showErrorAlert } from "../lib/alertHelpers";
import ClaimVerificationFailurePage from "../components/claims/ClaimVerificationFailurePage";
import ErrorPage from "../pages/error/errorPage";

export const claimRoutes = new Hono();

// GET - Show claim form
claimRoutes.get("/:creatorId", async (c) => {
  const creatorId = c.req.param("creatorId");
  const currentPath = c.req.query("currentPath");
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
      <ClaimCreatorBtn creator={creator} user={user} />
      <div id="toast"></div>
    </>,
  );
});

// POST - Create claim and send verification email
claimRoutes.post(
  "/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(claimFormSchema),
  async (c) => {
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
      user,
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

    console.log("got past try block", claim);

    return c.html(
      <>
        <Alert
          type="success"
          message={`Verification email sent! Please check your inbox.`}
        />
        <ClaimCreatorBtn creator={creator} user={user} />
      </>,
    );
  },
);

// GET - Verify claim (called from email link)
claimRoutes.get("/verify/:token", async (c) => {
  const token = c.req.param("token");
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
});
