import { Creator } from "../../../../db/schema";
import type { StubOutreachStats } from "../../../../domain/creators/stubOutreachStats";
import {
  creatorProfileUrl,
  creatorVerifiedSharePostHtml,
} from "../../../../lib/share";

export type ClaimApprovalEmailUser = {
  email: string;
  firstName: string | null;
};

const siteUrl = () => process.env.SITE_URL ?? "https://photobookers.com";

function statsBlock(stats: StubOutreachStats | null | undefined): string {
  if (!stats || stats.views + stats.outboundClicks + stats.favorites === 0) {
    return "";
  }

  const topBookLine =
    stats.topBookTitle && stats.topBookViews > 0
      ? `<li>Top book lately: <strong>${stats.topBookTitle}</strong> (${stats.topBookViews} views in the last 30 days)</li>`
      : "";

  return `
    <h3>Your traffic so far</h3>
    <ul>
      <li><strong>${stats.views}</strong> book views (last 30 days)</li>
      <li><strong>${stats.outboundClicks}</strong> outbound buy clicks</li>
      <li><strong>${stats.favorites}</strong> favorited</li>
      ${topBookLine}
    </ul>
    <p><a href="${siteUrl()}/dashboard/analytics">Open your full analytics dashboard</a></p>
  `;
}

export const generateClaimApprovalEmail = (
  claimUser: ClaimApprovalEmailUser,
  creator: Creator,
  stats?: StubOutreachStats | null,
) => {
  const profileUrl = creatorProfileUrl(creator.slug);
  const sharePostHtml = creatorVerifiedSharePostHtml(creator);
  const dashboardUrl = `${siteUrl()}/dashboard`;
  const profileEditUrl = `${siteUrl()}/dashboard/creators/${creator.id}`;
  const postsUrl = `${siteUrl()}/dashboard/posts`;

  return `
    <h2>Your creator profile is verified!</h2>
    <p>Hi ${claimUser.firstName ?? "there"},</p>
    <p>
      Your claim for <strong>${creator.displayName}</strong> has been approved.
      You can now publish books, edit your profile, post updates, and see your full analytics.
    </p>
    ${statsBlock(stats)}
    <h3>Get started</h3>
    <ul>
      <li><a href="${profileEditUrl}">Edit your profile</a></li>
      <li><a href="${dashboardUrl}">Manage your books</a></li>
      <li><a href="${postsUrl}">Write your first post</a></li>
      <li><a href="${profileUrl}">View your public profile</a></li>
    </ul>
    <p>
      We may feature newly verified creators on our Instagram — keep an eye out.
    </p>
    <h3>Share your profile</h3>
    <p>
      Help collectors find you — copy this post for Instagram, your newsletter, or your website:
    </p>
    ${sharePostHtml}
    <p>
      Tip: add your Photobookers link to your Instagram bio or website.
    </p>
  `;
};
