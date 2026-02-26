export function getCallbackErrorMessage(
  error: string | undefined,
  errorCode: string | undefined,
  errorDescription: string | undefined,
): string {
  if (
    errorCode === "otp_expired" ||
    errorDescription?.toLowerCase().includes("expired")
  ) {
    return "This verification link has expired or was already used. Please log in with your password, or register again to receive a new verification email.";
  }
  if (errorCode === "access_denied" || error === "access_denied") {
    return "This link is invalid or has expired. Please try logging in with your password, or register again to get a new verification email.";
  }
  if (error && errorDescription) {
    return errorDescription.replace(/\+/g, " ");
  }
  if (error) {
    return "Something went wrong with verification. Please try logging in or register again.";
  }
  return "No authorization code provided. If you were verifying your email, the link may have expired—please request a new one.";
}
