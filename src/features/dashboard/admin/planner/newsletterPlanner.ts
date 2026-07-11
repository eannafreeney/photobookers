import type {
  NewsletterCampaign,
  NewsletterCampaignStatus,
} from "../../../../db/schema";
import { toDateString, toWeekString } from "../../../../lib/utils";
import {
  getNewsletterRangeStartForPlannerWeek,
  resolveNewsletterRangeStart,
} from "./newsletter/utils";

export type PlannerNewsletterWeekData = {
  status: NewsletterCampaignStatus | null;
  campaignId: string | null;
  weekStart: Date;
};

export function mapPlannerNewsletterByWeekStart(
  weekStarts: Date[],
  campaigns: Pick<NewsletterCampaign, "id" | "status" | "sentAt" | "weekStart">[],
): Map<string, PlannerNewsletterWeekData> {
  const byWeek = new Map<string, PlannerNewsletterWeekData>();

  for (const plannerWeekStart of weekStarts) {
    const weekKey = toWeekString(plannerWeekStart);
    const editionRangeStart =
      getNewsletterRangeStartForPlannerWeek(plannerWeekStart);

    const campaign = campaigns.find(
      (entry) =>
        toDateString(resolveNewsletterRangeStart(entry.weekStart)) ===
        toDateString(editionRangeStart),
    );

    byWeek.set(weekKey, {
      status: campaign?.status ?? null,
      campaignId: campaign?.id ?? null,
      weekStart: editionRangeStart,
    });
  }

  return byWeek;
}
