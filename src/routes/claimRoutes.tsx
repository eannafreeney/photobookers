import { Hono } from "hono";
import { getUser, setFlash } from "../utils";
import AuthModal from "../components/app/AuthModal";
import { getCreatorById } from "../services/creators";
import Alert from "../components/app/Alert";
import Modal from "../components/app/Modal";
import ClaimCreatorBtn from "../components/claims/ClaimCreatorBtn";
import { formValidator, paramValidator } from "../lib/validator";
import { claimFormSchema, creatorIdSchema } from "../schemas";
import { normalizeUrl } from "../services/verification";
import {
  createClaim,
  generateEmailHtml,
  getClaimByToken,
  verifyClaim,
  deleteClaim,
} from "../services/claims";
import { supabaseAdmin } from "../lib/supabase";
import ClaimModal from "../components/claims/ClaimModal";
import { showErrorAlert } from "./booksDashboardRoutes";
import ClaimVerificationFailure from "../components/claims/ClaimVerificationFailure";
import ClaimVerificationSuccess from "../components/claims/ClaimVerificationSuccess";

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
        <AuthModal action="to claim this creator." redirectUrl={currentPath} />
      </>,
      422,
    );
  }

  const creator = await getCreatorById(creatorId);

  if (!creator) {
    return c.html(<Alert type="danger" message="Creator not found" />, 404);
  }

  const buttonType = c.req.query("buttonType") ?? "default";

  return c.html(
    <>
      <Modal>
        <ClaimModal creatorId={creatorId} user={user} buttonType={buttonType} />
      </Modal>
      <ClaimCreatorBtn
        creator={creator}
        isCircleButton={buttonType === "circle"}
        user={user}
      />
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
    const userId = user?.id;

    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return showErrorAlert(c, "Creator not found");
    }

    // Normalize and validate URL
    const verificationUrl = normalizeUrl(formData.verificationUrl);
    const verificationMethod = formData.verificationMethod || "website";

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

    const emailHtml = await generateEmailHtml(
      claim,
      user,
      creator,
      verificationUrl,
      verificationLink,
    );

    try {
      const { error } = await supabaseAdmin.functions.invoke("send-email", {
        body: {
          to: user?.email,
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

    const buttonType = formData.buttonType ?? "default";

    return c.html(
      <>
        <Alert
          type="success"
          message={`Verification email sent! Please check your inbox.`}
        />
        <ClaimCreatorBtn
          creator={creator}
          isCircleButton={buttonType === "circle"}
          user={user}
        />
      </>,
    );
  },
);

// GET - Verify claim (called from email link)
claimRoutes.get("/verify/:token", async (c) => {
  const token = c.req.param("token");
  const claim = await getClaimByToken(token);

  if (!claim) {
    return c.html(<Alert type="danger" message="Invalid verification link." />);
  }

  if (claim.status !== "pending") {
    const message =
      claim.status === "success"
        ? "This claim has already been verified."
        : "This claim is no longer pending.";
    return showErrorAlert(c, message);
  }

  // Attempt verification
  const result = await verifyClaim(claim);

  if (!result.verified) {
    return c.html(
      <ClaimVerificationFailure
        error={result.error}
        verificationCode={claim.verificationCode}
        verificationUrl={claim.verificationUrl}
        creatorId={claim.creatorId}
      />,
    );
  }

  setFlash(
    c,
    "success",
    "Verification successful. You can now start uploading books and editing your profile.",
  );
  return c.redirect("/dashboard/creators");
});
