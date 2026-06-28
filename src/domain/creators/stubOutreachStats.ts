import type { CreatorType } from "../../db/schema";
import { getCreatorFunnelTotals } from "../../features/book-analytics/creatorAnalytics";
import {
  presetAnalyticsDateRange,
  type AnalyticsDateRange,
} from "../../features/book-analytics/dateRange";
import { getTopBooksByViews } from "../../features/book-views/services";
import { creatorProfileUrl } from "../../lib/share";

export type StubOutreachStats = {
  views: number;
  outboundClicks: number;
  wishlists: number;
  collections: number;
  clickRate: number | null;
  topBookTitle: string | null;
  topBookViews: number;
  profileUrl: string;
  claimUrl: string;
};

type CreatorScope = {
  id: string;
  slug: string;
  type: CreatorType;
};

export async function getStubOutreachStats(
  creator: CreatorScope,
  range: AnalyticsDateRange = presetAnalyticsDateRange(30),
): Promise<StubOutreachStats> {
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
    wishlists: totals.wishlists,
    collections: totals.collections,
    clickRate: totals.clickRate,
    topBookTitle: topBook?.title ?? null,
    topBookViews: topBook?.viewCount ?? 0,
    profileUrl,
    claimUrl,
  };
}

export {
  allStubViewMilestonesSent,
  hasSentAnyStubViewMilestone,
  pickNextStubViewMilestone,
  STUB_VIEW_MILESTONE_KINDS,
  STUB_VIEW_MILESTONE_THRESHOLDS,
  stubViewMilestoneThreshold,
  type StubViewMilestoneKind,
} from "./stubOutreachMilestones";
