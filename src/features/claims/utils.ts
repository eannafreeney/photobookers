import { Creator } from "../../db/schema";
import { sendEmail } from "../../lib/sendEmail";
import { getHostname } from "../../services/verification";
import {
  type ClaimApprovalEmailUser,
  generateClaimApprovalEmail,
} from "../dashboard/admin/claims/emails";

export type { ClaimApprovalEmailUser };

export const emailMatchesWebsite = (
  email: string,
  websiteUrl: string,
): boolean => {
  const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
  const websiteHost = getHostname(websiteUrl);
  return emailDomain.length > 0 && emailDomain === websiteHost;
};

export async function sendCreatorVerifiedEmail(
  user: ClaimApprovalEmailUser,
  creator: Creator,
) {
  const html = generateClaimApprovalEmail(user, creator);
  return sendEmail(
    user.email,
    `Your ${creator.displayName} profile is verified on Photobookers`,
    html,
  );
}
