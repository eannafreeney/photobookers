import { escapeHtml } from "../dashboard/admin/planner/shareKit.js";
import {
  stubViewMilestoneThreshold
} from "../../domain/creators/stubOutreachMilestones.js";
const STUB_OUTREACH_OPT_OUT_FOOTER = `<p style="font-size: 12px; color: #666;">Don't want outreach emails from Photobookers? Reply to this message and we'll remove you.</p>`;
function stubViewMilestoneEmailSubject(milestone) {
  const threshold = stubViewMilestoneThreshold(milestone);
  return `Your books reached ${threshold} views on Photobookers`;
}
function generateStubViewMilestoneEmail(params) {
  const threshold = stubViewMilestoneThreshold(params.milestone);
  const intro = params.milestone === "views_50" ? "We wrote when we added your profile \u2014 your books are getting attention." : "Your books on Photobookers continue to pick up traffic.";
  const topBookBlock = params.stats.topBookTitle && params.stats.topBookViews > 0 ? `<p>Top book lately: <strong>${escapeHtml(params.stats.topBookTitle)}</strong> \u2014 ${params.stats.topBookViews} view${params.stats.topBookViews === 1 ? "" : "s"} in the last 30 days.</p>` : "";
  const recentStatsBlock = params.stats.views > 0 ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin: 16px 0;">
    <tr><td style="padding: 4px 16px 4px 0;"><strong>${params.stats.views}</strong> book views (last 30 days)</td></tr>
    <tr><td style="padding: 4px 16px 4px 0;"><strong>${params.stats.outboundClicks}</strong> outbound clicks to buy</td></tr>
    <tr><td style="padding: 4px 16px 4px 0;"><strong>${params.stats.favorites}</strong> favorited</td></tr>
  </table>` : "";
  return `
  <p>Hi ${escapeHtml(params.displayName)},</p>
  <p>${intro}</p>
  <p>Your catalogue has reached <strong>${threshold} views</strong> on Photobookers (${params.allTimeViews.toLocaleString()} all time).</p>
  ${recentStatsBlock}
  ${topBookBlock}
  <p><a href="${escapeHtml(params.claimUrl)}">Claim your profile</a> to manage your books and see analytics \xB7 <a href="${escapeHtml(params.profileUrl)}">View your public profile</a></p>
  ${STUB_OUTREACH_OPT_OUT_FOOTER}
  <p>Best regards,<br/>Eanna</p>
`;
}
export {
  STUB_OUTREACH_OPT_OUT_FOOTER,
  generateStubViewMilestoneEmail,
  stubViewMilestoneEmailSubject
};
