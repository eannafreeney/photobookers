import { err, ok } from "../../lib/result.js";
import { createSupabaseClient } from "../../lib/supabase.js";
function getCallbackErrorMessage(error, errorCode, errorDescription, context = "signup") {
  const recoveryHint = "Please request a new password reset link from the forgot password page.";
  const signupHint = "Please log in with your password, or register again to receive a new verification email.";
  if (errorCode === "otp_expired" || errorDescription?.toLowerCase().includes("expired")) {
    return context === "recovery" ? `This password reset link has expired or was already used. ${recoveryHint}` : `This verification link has expired or was already used. ${signupHint}`;
  }
  if (errorCode === "access_denied" || error === "access_denied") {
    return context === "recovery" ? `This password reset link is invalid or has expired. ${recoveryHint}` : `This link is invalid or has expired. ${signupHint}`;
  }
  if (error && errorDescription) {
    return errorDescription.replace(/\+/g, " ");
  }
  if (error) {
    return "Something went wrong with verification. Please try logging in or register again.";
  }
  return "No authorization code provided. If you were verifying your email, the link may have expired\u2014please request a new one.";
}
async function verifyOtpForSignup(c, tokenHash) {
  const supabase = createSupabaseClient(c);
  const { error, data } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "signup"
  });
  if (error || !data?.session) {
    return err({
      reason: error?.message ?? "Failed to create session",
      cause: error
    });
  }
  return ok(data.session);
}
async function verifyOtpForRecovery(c, tokenHash) {
  const supabase = createSupabaseClient(c);
  const { error, data } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery"
  });
  if (error || !data?.session) {
    return err({
      reason: error?.message ?? "Failed to verify reset link",
      cause: error
    });
  }
  return ok(data.session);
}
function getPendingCreatorId(metadata) {
  return typeof metadata?.creatorId === "string" ? metadata.creatorId : null;
}
function getPendingVerificationUrl(metadata) {
  return typeof metadata?.verificationUrl === "string" ? metadata.verificationUrl : null;
}
export {
  getCallbackErrorMessage,
  getPendingCreatorId,
  getPendingVerificationUrl,
  verifyOtpForRecovery,
  verifyOtpForSignup
};
