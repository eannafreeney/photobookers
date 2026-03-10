export function generateVerificationWelcomeEmail(firstName: string | null) {
  const name = firstName ?? "there";
  return `
      <h2>You're verified!</h2>
      <p>Hi ${name},</p>
      <p>Your Photobookers account is now verified. Here's what you can do now:</p>
      <ul>
        <li>Browse and discover photobooks</li>
        <li>Save favorites and follow creators</li>
        <li>Create a creator profile and share your own books (from your account)</li>
      </ul>
      <p><a href="${process.env.SITE_URL ?? "https://photobookers.com"}">Go to Photobookers</a></p>
    `;
}
