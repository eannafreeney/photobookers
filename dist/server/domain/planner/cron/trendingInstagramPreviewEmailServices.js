import { sendAdminEmail } from "../../../lib/sendEmail.js";
import { err, ok } from "../../../lib/result.js";
import { buildInstagramCancelUrl } from "../../../lib/adminActionToken.js";
import {
  buildTrendingInstagramPreviewEmail
} from "../../../features/dashboard/admin/planner/emails.js";
import { buildTrendingInstagramDueAt } from "../trendingInstagram/schedule.js";
const TRENDING_KIND_TITLES = {
  books: "Trending books",
  artists: "Trending artists",
  publishers: "Trending publishers"
};
async function sendTrendingInstagramPreviewEmail(params) {
  const posts = [];
  for (const kind of ["books", "artists", "publishers"]) {
    const post = params.state.posts[kind];
    if (!post?.imageUrls?.length || !post.caption || post.cancelledAt) continue;
    if (post.previewEmailSentAt) continue;
    posts.push({
      title: TRENDING_KIND_TITLES[kind],
      imageUrls: post.imageUrls.slice(0, 3),
      caption: post.caption,
      scheduledAt: buildTrendingInstagramDueAt(params.sendWednesday, kind),
      cancelUrl: buildInstagramCancelUrl({
        type: "trending",
        campaignId: params.campaignId,
        kind
      })
    });
  }
  if (posts.length === 0) return ok({ sent: false });
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const html = buildTrendingInstagramPreviewEmail({
    editionWeekStart: params.editionWeekStart,
    posts,
    plannerUrl: `${siteUrl}/dashboard/admin/planner`
  });
  const subject = `Trending Instagram preview \u2014 ${params.editionWeekStart}`;
  if (params.dryRun) return ok({ sent: true });
  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) return err(emailError);
  return ok({ sent: true });
}
function markTrendingPreviewEmailSent(state, kinds) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const posts = { ...state.posts };
  for (const kind of kinds) {
    const post = posts[kind];
    if (!post) continue;
    posts[kind] = { ...post, previewEmailSentAt: now };
  }
  return { ...state, posts };
}
export {
  markTrendingPreviewEmailSent,
  sendTrendingInstagramPreviewEmail
};
