import { AuthUser } from "../../../../../types";
import { Creator } from "../../../../db/schema";

export const generateClaimApprovalEmail = async (
  user: AuthUser,
  creator: Creator,
) => {
  return `
          <h2>Your Creator Profile Claim has been approved!</h2>
          <p>Hello ${user?.firstName},</p>
          <p>Your claim for the creator profile for <strong>${creator.displayName}</strong> has been approved.</p>
          <p>You can now start uploading books and editing your profile.</p>
  
        `;
};
