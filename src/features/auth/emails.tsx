import { Creator } from "../../db/schema";

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

export function generateFanNotificationEmail(
  firstName: string,
  lastName: string,
  email: string,
) {
  return `
    <h2>New fan registered</h2>
    <p>A new fan has been registered.</p>
    <p>Name: ${firstName} ${lastName}</p>
    <p>Email: ${email}</p>
  `;
}

export function generateCreatorNotificationEmail(creator: Creator) {
  return `
    <h2>New creator registered</h2>
    <p>A new creator has been registered.</p>
    <p>Name: ${creator.displayName}</p>
    <p>Type: ${creator.type}</p>
    <p>Website: ${creator.website}</p>
    <p>Status: ${creator.status}</p>
    <p>Created At: ${creator.createdAt}</p>
    <p>Updated At: ${creator.updatedAt}</p>
  `;
}
