import { User } from "../../../../db/schema";

export const generateMagicLinkEmail = async (
  user: User,
  actionLink: string,
) => {
  return `
        <h2>Reset Your Password</h2>
        <p>Hi, ${user.firstName} ${user.lastName}! </p>
        <p>Click the button below to log in to your Photobookers account and reset your password:</p>
        <a href="${actionLink}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Reset My Password
        </a>
        <small>This link will expire in 24 hours.</small>
      `;
};
