import { getCreatorById } from "../dashboard/creators/services.js";
import { assignUserAsCreatorOwnerAdmin } from "../dashboard/admin/claims/services.js";
import { verifyOtpForClaimSignup } from "../auth/services.js";
import { createClaimWithStatus } from "./services.js";
import { resolveClaimVerificationUrl, getSubmittedClaimVerificationUrl } from "./verificationUrl.js";
import {
  emailMatchesWebsite,
  sendCreatorVerifiedEmail
} from "./utils.js";
async function submitClaimForUser(user, creatorId, formData) {
  const [creatorError, creator] = await getCreatorById(creatorId);
  if (creatorError || !creator) {
    return { type: "error", message: "Creator not found" };
  }
  const resolved = resolveClaimVerificationUrl(
    creator.website,
    getSubmittedClaimVerificationUrl(formData)
  );
  if (!resolved.ok) {
    return { type: "error", message: resolved.message };
  }
  const verificationUrl = resolved.verificationUrl;
  const domainMatches = verificationUrl ? emailMatchesWebsite(user.email, verificationUrl) : false;
  const status = domainMatches && creator.website ? "approved" : "pending_admin_review";
  const [createClaimError, creatorClaim] = await createClaimWithStatus(
    user.id,
    creatorId,
    verificationUrl,
    status
  );
  if (createClaimError || !creatorClaim) {
    return {
      type: "error",
      message: createClaimError?.reason ?? "Failed to create claim"
    };
  }
  if (status === "approved") {
    await assignUserAsCreatorOwnerAdmin(user.id, creatorId, true);
    await sendCreatorVerifiedEmail(user, creator);
    return { type: "approved" };
  }
  return { type: "pending" };
}
async function registerAndClaimForCreator(c, creatorId, formData) {
  const [error, creator] = await getCreatorById(creatorId);
  if (error || !creator) {
    return { type: "error", message: "Creator not found" };
  }
  if (creator.status !== "stub") {
    return {
      type: "error",
      message: "This profile is not available to claim."
    };
  }
  const resolved = resolveClaimVerificationUrl(
    creator.website,
    getSubmittedClaimVerificationUrl(formData)
  );
  if (!resolved.ok) {
    return { type: "error", message: resolved.message };
  }
  const [verifyOtpError] = await verifyOtpForClaimSignup(
    c,
    formData,
    creatorId,
    resolved.verificationUrl
  );
  if (verifyOtpError) {
    return { type: "error", message: verifyOtpError.reason };
  }
  return { type: "success" };
}
export {
  registerAndClaimForCreator,
  submitClaimForUser
};
