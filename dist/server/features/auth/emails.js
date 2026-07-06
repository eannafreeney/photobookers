function generateVerificationWelcomeEmail(firstName, interviewLink) {
  const name = firstName ?? "there";
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  return `
      <h2>You're verified!</h2>
      <p>Hi ${name},</p>
      <p>Your Photobookers account is now verified. Here's what you can do now:</p>
      <ul>
        <li>Browse and discover photobooks</li>
        <li>Save favorites and follow creators</li>
        <li>Create a creator profile and share your own books (from your account)</li>
      </ul>
      ${interviewLink ? `<p>We'd also love to feature you in a short interview. It takes around 10 minutes and your answers will be published on our main page.</p>
      <p><a href="${interviewLink}">Start the interview</a></p>` : ""}
      <p><a href="${siteUrl}">Go to Photobookers</a></p>
    `;
}
function generateFanNotificationEmail(firstName, lastName, email) {
  return `
    <p>A new fan has been registered.</p>
    <p>Name: ${firstName} ${lastName}</p>
    <p>Email: ${email}</p>
  `;
}
function generateCreatorNotificationEmail(formData) {
  return `
    <h2>New creator registered</h2>
    <p>A new creator has been registered.</p>
    <p>Name: ${formData.displayName}</p>
    <p>Type: ${formData.type}</p>
    <p>Website: ${formData.website}</p>
  `;
}
function generateVerificationSuccessEmailAdmin(email) {
  return `
    <h2>New user verified</h2>
    <p>A new user has been verified.</p>
    <p>Email: ${email}</p>
  `;
}
export {
  generateCreatorNotificationEmail,
  generateFanNotificationEmail,
  generateVerificationSuccessEmailAdmin,
  generateVerificationWelcomeEmail
};
