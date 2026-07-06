import { getCreatorFunnelTotals } from "../../features/book-analytics/creatorAnalytics.js";
import {
  presetAnalyticsDateRange
} from "../../features/book-analytics/dateRange.js";
import { getTopBooksByViews } from "../../features/book-views/services.js";
import { creatorProfileUrl } from "../../lib/share.js";
async function getStubOutreachStats(creator, range = presetAnalyticsDateRange(30)) {
  const scope = { creatorId: creator.id, creatorType: creator.type };
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  const profileUrl = creatorProfileUrl(creator.slug);
  const claimUrl = `${siteUrl}/claims/${creator.id}/start`;
  const totals = await getCreatorFunnelTotals(scope, range);
  const [, topViewsResult] = await getTopBooksByViews(range, 1, 1, scope);
  const topBook = topViewsResult?.books[0] ?? null;
  return {
    views: totals.views,
    outboundClicks: totals.outboundClicks,
    favorites: totals.favorites,
    clickRate: totals.clickRate,
    topBookTitle: topBook?.title ?? null,
    topBookViews: topBook?.viewCount ?? 0,
    profileUrl,
    claimUrl
  };
}
import {
  allStubViewMilestonesSent,
  hasSentAnyStubViewMilestone,
  pickNextStubViewMilestone,
  STUB_VIEW_MILESTONE_KINDS,
  STUB_VIEW_MILESTONE_THRESHOLDS,
  stubViewMilestoneThreshold
} from "./stubOutreachMilestones.js";
export {
  STUB_VIEW_MILESTONE_KINDS,
  STUB_VIEW_MILESTONE_THRESHOLDS,
  allStubViewMilestonesSent,
  getStubOutreachStats,
  hasSentAnyStubViewMilestone,
  pickNextStubViewMilestone,
  stubViewMilestoneThreshold
};
