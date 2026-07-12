import type { Context } from "hono";
import { getCreatorById } from "../dashboard/creators/services";
import { assignUserAsCreatorOwnerAdmin } from "../dashboard/admin/claims/services";
import { verifyOtpForClaimSignup } from "../auth/services";
import { createClaimWithStatus } from "./services";
import { resolveClaimVerificationUrl, getSubmittedClaimVerificationUrl } from "./verificationUrl";
import {
  type ClaimApprovalEmailUser,
  emailMatchesWebsite,
  sendCreatorVerifiedEmail,
} from "./utils";
import type { registerAndClaimFormSchema } from "./schema";
import type z from "zod";

type ClaimFormData = {
  verificationUrl?: string;
  form?: {
    verificationUrl?: string;
  };
};

export type ClaimSubmitUser = ClaimApprovalEmailUser & {
  id: string;
};

export type ClaimSubmissionResult =
  | { type: "approved" }
  | { type: "pending" }
  | { type: "error"; message: string };

export async function submitClaimForUser(
  user: ClaimSubmitUser,
  creatorId: string,
  formData: ClaimFormData,
): Promise<ClaimSubmissionResult> {
  const [creatorError, creator] = await getCreatorById(creatorId);
  if (creatorError || !creator) {
    return { type: "error", message: "Creator not found" };
  }

  const resolved = resolveClaimVerificationUrl(
    creator.website,
    getSubmittedClaimVerificationUrl(formData),
  );
  if (!resolved.ok) {
    return { type: "error", message: resolved.message };
  }
  const verificationUrl = resolved.verificationUrl;

  const domainMatches = verificationUrl
    ? emailMatchesWebsite(user.email, verificationUrl)
    : false;
  const status =
    domainMatches && creator.website ? "approved" : "pending_admin_review";

  const [createClaimError, creatorClaim] = await createClaimWithStatus(
    user.id,
    creatorId,
    verificationUrl,
    status,
  );
  if (createClaimError || !creatorClaim) {
    return {
      type: "error",
      message: createClaimError?.reason ?? "Failed to create claim",
    };
  }

  if (status === "approved") {
    await assignUserAsCreatorOwnerAdmin(user.id, creatorId, true);
    await sendCreatorVerifiedEmail(user, creator);
    return { type: "approved" };
  }

  return { type: "pending" };
}

export type RegisterAndClaimResult =
  | { type: "success" }
  | { type: "error"; message: string };

export async function registerAndClaimForCreator(
  c: Context,
  creatorId: string,
  formData: z.infer<typeof registerAndClaimFormSchema>,
): Promise<RegisterAndClaimResult> {
  const [error, creator] = await getCreatorById(creatorId);
  if (error || !creator) {
    return { type: "error", message: "Creator not found" };
  }
  if (creator.status !== "stub") {
    return {
      type: "error",
      message: "This profile is not available to claim.",
    };
  }

  const resolved = resolveClaimVerificationUrl(
    creator.website,
    getSubmittedClaimVerificationUrl(formData),
  );
  if (!resolved.ok) {
    return { type: "error", message: resolved.message };
  }

  const [verifyOtpError] = await verifyOtpForClaimSignup(
    c,
    formData,
    creatorId,
    resolved.verificationUrl,
  );
  if (verifyOtpError) {
    return { type: "error", message: verifyOtpError.reason };
  }

  return { type: "success" };
}
