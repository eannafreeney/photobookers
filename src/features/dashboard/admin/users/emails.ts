type LoginInstructionsEmailParams = {
  firstName?: string | null;
  creatorDisplayName?: string | null;
  setPasswordLink: string;
  purpose: "account_created" | "password_reset";
};

export function generateLoginInstructionsEmail({
  firstName,
  creatorDisplayName,
  setPasswordLink,
  purpose,
}: LoginInstructionsEmailParams): string {
  const name = firstName?.trim() || "there";
  const intro =
    purpose === "account_created"
      ? "An account has been created for you on Photobookers."
      : "Your Photobookers password has been reset.";

  const creatorLine = creatorDisplayName
    ? `<p>Your account is linked to the creator profile <strong>${creatorDisplayName}</strong>.</p>`
    : "";

  return `
    <h2>Sign in to Photobookers</h2>
    <p>Hi ${name},</p>
    <p>${intro}</p>
    ${creatorLine}
    <p>
      Use the link below to set your password and sign in. This link expires after a
      short time; if it has expired, use the forgot password page to request a new one.
    </p>
    <p><a href="${setPasswordLink}">Set your password</a></p>
    <p>If you did not expect this email, you can ignore it.</p>
  `;
}

export function loginInstructionsEmailSubject(
  purpose: LoginInstructionsEmailParams["purpose"],
): string {
  return purpose === "account_created"
    ? "Your Photobookers account is ready"
    : "Reset your Photobookers password";
}
