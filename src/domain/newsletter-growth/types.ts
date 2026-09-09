import type { AnalyticsDateRange } from "../../features/book-analytics/dateRange";
import type { PeriodDelta } from "../ceo-metrics/format";

export type NewsletterCampaignWeekStats = {
  id: number;
  name: string;
  subject: string;
  sentDate: string | null;
  sent: number;
  delivered: number;
  uniqueOpens: number;
  uniqueClicks: number;
  unsubscriptions: number;
  openRate: number | null;
  clickRate: number | null;
};

export type NewsletterGrowthReport = {
  range: AnalyticsDateRange;
  previousRange: AnalyticsDateRange;
  totalSubscribers: number;
  signupsThisWeek: number;
  signupsLastWeek: number;
  signupsDelta: PeriodDelta;
  campaign: NewsletterCampaignWeekStats | null;
  editorialBuyClicks: number;
  editorialBuyClicksDelta: PeriodDelta;
  botdPageBuyClicks: number;
  botdBookBuyClicks: number;
  allBuyClicks: number;
};
