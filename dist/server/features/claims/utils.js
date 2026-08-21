import { sendEmail } from "../../lib/sendEmail.js";
import { getStubOutreachStats } from "../../domain/creators/stubOutreachStats.js";
import { getHostname } from "../../services/verification.js";
import {
  generateClaimApprovalEmail
} from "../dashboard/admin/claims/emails.js";
const emailMatchesWebsite = (email, websiteUrl) => {
  const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
  const websiteHost = getHostname(websiteUrl);
  return emailDomain.length > 0 && emailDomain === websiteHost;
};
async function sendCreatorVerifiedEmail(user, creator) {
  const stats = await getStubOutreachStats({
    id: creator.id,
    slug: creator.slug,
    type: creator.type
  });
  const html = generateClaimApprovalEmail(user, creator, stats);
  return sendEmail(
    user.email,
    `Your ${creator.displayName} profile is verified on Photobookers`,
    html
  );
}
export {
  emailMatchesWebsite,
  sendCreatorVerifiedEmail
};
