import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../lib/validator";
import { registerAndClaimFormSchema } from "../../../features/claims/schema";
import { creatorIdSchema } from "../../../schemas";
import { RegisterAndClaimFormContext } from "../../../features/claims/types";
import { getCreatorById } from "../../../features/dashboard/creators/services";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import { resolveClaimVerificationUrl, getSubmittedClaimVerificationUrl } from "../../../features/claims/verificationUrl";
import { verifyOtpForClaimSignup } from "../../../features/auth/services";

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(registerAndClaimFormSchema),
  async (c: RegisterAndClaimFormContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const formData = c.req.valid("form");

    const [error, creator] = await getCreatorById(creatorId);
    if (error || !creator) {
      return showErrorAlert(c, "Creator not found");
    }
    if (!creator) return showErrorAlert(c, "Creator not found");
    if (creator.status !== "stub")
      return showErrorAlert(c, "This profile is not available to claim.");

    const resolved = resolveClaimVerificationUrl(
      creator.website,
      getSubmittedClaimVerificationUrl(formData),
    );
    if (!resolved.ok) {
      return showErrorAlert(c, resolved.message);
    }

    const [verifyOtpError] = await verifyOtpForClaimSignup(
      c,
      formData,
      creatorId,
      resolved.verificationUrl,
    );
    if (verifyOtpError) return showErrorAlert(c, verifyOtpError.reason);

    return showSuccessAlert(
      c,
      "Your claim has been submitted. Please check your email for verification.",
    );
  },
);
