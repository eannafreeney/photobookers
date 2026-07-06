import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../lib/validator.js";
import { registerAndClaimFormSchema } from "../../../features/claims/schema.js";
import { creatorIdSchema } from "../../../schemas/index.js";
import { getCreatorById } from "../../../features/dashboard/creators/services.js";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers.js";
import { normalizeUrl } from "../../../services/verification.js";
import { verifyOtpForClaimSignup } from "../../../features/auth/services.js";
const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(registerAndClaimFormSchema),
  async (c) => {
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
    const verificationUrl = rawUrl ? normalizeUrl(rawUrl) : null;
    const [verifyOtpError] = await verifyOtpForClaimSignup(
      c,
      formData,
      creatorId,
      verificationUrl
    );
    if (verifyOtpError) return showErrorAlert(c, verifyOtpError.reason);
    return showSuccessAlert(
      c,
      "Your claim has been submitted. Please check your email for verification."
    );
  }
);
export {
  POST
};
