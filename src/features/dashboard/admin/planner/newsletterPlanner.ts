import type {
  NewsletterCampaign,
  NewsletterCampaignStatus,
} from "../../../../db/schema";
import { toDateString, toWeekString } from "../../../../lib/utils";
import { getNewsletterRangeStartForPlannerWeek } from "./newsletter/utils";
import { addUtcDays } from "./utils";

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
    const sentCampaign = campaigns.find(
      (entry) =>
        entry.status === "sent" &&
        entry.sentAt &&
        toWeekString(entry.sentAt) === weekKey,
    );

    if (sentCampaign) {
      byWeek.set(weekKey, {
        status: sentCampaign.status,
        campaignId: sentCampaign.id,
        weekStart: sentCampaign.weekStart,
      });
      continue;
    }

    const defaultRangeStart = getNewsletterRangeStartForPlannerWeek(
      plannerWeekStart,
    );
    const defaultCampaign = campaigns.find(
      (entry) =>
        toDateString(entry.weekStart) === toDateString(defaultRangeStart),
    );
    const selectedWeekStart =
      defaultCampaign?.status === "sent" &&
      defaultCampaign.sentAt &&
      toWeekString(defaultCampaign.sentAt) !== weekKey
        ? addUtcDays(defaultRangeStart, 7)
        : defaultRangeStart;
    const selectedCampaign = campaigns.find(
      (entry) =>
        toDateString(entry.weekStart) === toDateString(selectedWeekStart),
    );

    byWeek.set(weekKey, {
      status: selectedCampaign?.status ?? null,
      campaignId: selectedCampaign?.id ?? null,
      weekStart: selectedWeekStart,
    });
  }

  return byWeek;
}
