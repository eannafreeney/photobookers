import { Hono } from "hono";
import { getUser } from "../utils";
import AuthModal from "../components/app/AuthModal";
import { getCreatorById } from "../services/creators";
import Alert from "../components/app/Alert";
import Modal from "../components/app/Modal";
import Input from "../components/cms/ui/Input";
import Button from "../components/app/Button";
import ClaimCreatorBtn from "../components/app/ClaimCreatorBtn";
import { formValidator, paramValidator } from "../lib/validator";
import { claimFormSchema, creatorIdSchema } from "../schemas";
import { normalizeUrl } from "../services/verification";
import {
  createClaim,
  generateEmailHtml,
  getClaimByToken,
  verifyClaim,
} from "../services/claims";
import { supabaseAdmin } from "../lib/supabase";
import ClaimModal from "../components/claims/ClaimModal";

export const claimRoutes = new Hono();

// GET - Show claim form
claimRoutes.get("/:creatorId", async (c) => {
  const creatorId = c.req.param("creatorId");
  const currentPath = c.req.query("currentPath");
  const user = await getUser(c);
  const userId = user?.id;

  if (!userId) {
    return c.html(
      <AuthModal action="to claim this creator." redirectUrl={currentPath} />,
      422
    );
  }

  const creator = await getCreatorById(creatorId);

  if (!creator) {
    return c.html(<Alert type="danger" message="Creator not found" />, 404);
  }

  return c.html(
    <>
      <Modal>
        <ClaimModal creatorId={creatorId} user={user} />
      </Modal>
      <ClaimCreatorBtn creator={creator} />
    </>
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

    if (!userId) {
      return c.html(<AuthModal action="to claim this creator." />, 401);
    }

    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return c.html(<Alert type="danger" message="Creator not found" />, 404);
    }

    // Normalize and validate URL
    const verificationUrl = normalizeUrl(formData.verificationUrl);
    const verificationMethod = formData.verificationMethod || "website";

    // Create claim
    const claim = await createClaim(
      userId,
      creatorId,
      verificationUrl,
      verificationMethod
    );

    // Send verification email
    const verificationLink = `${c.req.url.split("/claim")[0]}/claim/verify/${
      claim.verificationToken
    }`;

    const emailHtml = await generateEmailHtml(
      claim,
      user,
      creator,
      verificationUrl,
      verificationLink
    );

    try {
      const { error } = await supabaseAdmin.functions.invoke("send-email", {
        body: {
          to: user?.email,
          subject: `Verify Your Claim for ${creator.displayName}`,
          html: emailHtml,
        },
      });

      if (error) {
        console.error("Failed to send email:", error);
        return c.html(
          <Alert
            type="danger"
            message="Failed to send verification email. Please try again."
          />
        );
      }
    } catch (error) {
      console.error("Email error:", error);
      return c.html(
        <Alert
          type="danger"
          message="Failed to send verification email. Please try again."
        />
      );
    }

    return c.html(
      <Alert
        type="success"
        message={`Verification email sent! Please check your inbox.`}
      />
    );
  }
);

// GET - Verify claim (called from email link)
claimRoutes.get("/verify/:token", async (c) => {
  const token = c.req.param("token");
  const claim = await getClaimByToken(token);

  if (!claim) {
    return c.html(<Alert type="danger" message="Invalid verification link." />);
  }

  if (claim.status !== "pending") {
    return c.html(
      <Alert
        type="info"
        message={
          claim.status === "admin_accepted"
            ? "This claim has already been verified."
            : "This claim is no longer pending."
        }
      />
    );
  }

  // Attempt verification
  const result = await verifyClaim(claim);

  if (!result.verified) {
    return c.html(
      <div class="p-8">
        <h2 class="text-2xl font-bold mb-4">❌ Verification Failed</h2>
        <p class="mb-2">{result.error || "Could not verify your website."}</p>
        <p class="text-sm text-gray-600 mb-4">
          Make sure you've added the code{" "}
          <strong>{claim.verificationCode}</strong> to your website at{" "}
          {claim.verificationUrl}
        </p>
        <p class="text-sm">
          <a href={`/claim/${claim.creatorId}`} class="text-blue-600 underline">
            Try again
          </a>
        </p>
      </div>
    );
  }

  return c.html(
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-4">✅ Verification Successful!</h2>
      <p>
        Your creator profile has been claimed successfully. You can now manage
        it from your dashboard.
      </p>
      <a
        href="/dashboard/creators"
        class="mt-4 inline-block text-blue-600 underline"
      >
        Go to Dashboard
      </a>
    </div>
  );
});
