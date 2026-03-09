import { AuthUser } from "../../../types";
import { Creator, CreatorClaim, User } from "../../db/schema";

export const generateClaimApprovalEmail = async (creator: Creator) => {
  return `
        <h2>Your Creator Profile Claim has been approved!</h2>
        <p>Hello,</p>
        <p>Your claim for the creator profile for <strong>${creator.displayName}</strong> has been approved.</p>
        <p>You can now start uploading books and editing your profile.</p>

      `;
};

export const generatePendingReviewEmail = async (creator: Creator) => {
  return `
        <h2>Your Creator Profile Claim is pending review</h2>
        <p>Hello,</p>
        <p>Your claim for the creator profile for <strong>${creator.displayName}</strong> is pending review.</p>
      `;
};

export const generateClaimRejectionEmail = async (
  user: AuthUser,
  creator: Creator,
) => {
  return `
        <h2>Your Creator Profile Claim has been rejected</h2>
        <p>Hello ${user?.firstName},</p>
        <p>Your claim for the creator profile for <strong>${creator.displayName}</strong> has been rejected.</p>
        <p>Please try again.</p>
      `;
};
