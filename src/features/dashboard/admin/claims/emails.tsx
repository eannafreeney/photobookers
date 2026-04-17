import { Creator, User } from "../../../../db/schema";

export const generateClaimApprovalEmail = async (
  claimUser: User,
  creator: Creator,
) => {
  return `
          <h2>Your Creator Profile Claim has been approved!</h2>
          <p>Hello ${claimUser.firstName},</p>
          <p>Your claim for the creator profile for <strong>${creator.displayName}</strong> has been approved.</p>
          <p>You can now start uploading books and editing your profile.</p>
  
        `;
};
