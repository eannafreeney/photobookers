import {
  creatorProfileUrl,
  creatorVerifiedSharePostHtml
} from "../../../../lib/share.js";
const generateClaimApprovalEmail = (claimUser, creator) => {
  const profileUrl = creatorProfileUrl(creator.slug);
  const sharePostHtml = creatorVerifiedSharePostHtml(creator);
  return `
    <h2>Your creator profile is verified!</h2>
    <p>Hi ${claimUser.firstName ?? "there"},</p>
    <p>
      Your claim for <strong>${creator.displayName}</strong> has been approved.
      You can now publish books and edit your profile.
    </p>
    <p><a href="${profileUrl}">View your Photobookers profile</a></p>
    <p><a href="https://www.photobookers.com/dashboard">Go to your dashboard</a></p>
    <h3>Share your profile</h3>
    <p>
      Help collectors find you \u2014 copy this post for Instagram, your newsletter, or your website:
    </p>
    ${sharePostHtml}
    <p>
      Tip: add your Photobookers link to your Instagram bio or website.
    </p>
  `;
};
export {
  generateClaimApprovalEmail
};
