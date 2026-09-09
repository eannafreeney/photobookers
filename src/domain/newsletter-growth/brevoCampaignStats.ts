import type { NewsletterCampaignWeekStats } from "./types";
import { ratePercent } from "./format";

type BrevoGlobalStats = {
  uniqueClicks?: number;
  uniqueViews?: number;
  delivered?: number;
  sent?: number;
  unsubscriptions?: number;
};

export type BrevoCampaignRow = {
  id?: number;
  name?: string;
  subject?: string;
  sentDate?: string;
  status?: string;
  statistics?: { globalStats?: BrevoGlobalStats };
};

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function parseBrevoCampaignStats(
  raw: BrevoCampaignRow,
): NewsletterCampaignWeekStats | null {
  const id = raw.id;
  if (typeof id !== "number" || !Number.isFinite(id)) return null;

  const stats = raw.statistics?.globalStats ?? {};
  const delivered = asCount(stats.delivered);
  const uniqueOpens = asCount(stats.uniqueViews);
  const uniqueClicks = asCount(stats.uniqueClicks);

  return {
    id,
    name: raw.name?.trim() || `Campaign ${id}`,
    subject: raw.subject?.trim() || "(no subject)",
    sentDate: raw.sentDate?.trim() || null,
    sent: asCount(stats.sent),
    delivered,
    uniqueOpens,
    uniqueClicks,
    unsubscriptions: asCount(stats.unsubscriptions),
    openRate: ratePercent(uniqueOpens, delivered),
    clickRate: ratePercent(uniqueClicks, delivered),
  };
}

export function pickLatestSentCampaign(
  campaigns: BrevoCampaignRow[],
): NewsletterCampaignWeekStats | null {
  for (const campaign of campaigns) {
    const parsed = parseBrevoCampaignStats(campaign);
    if (!parsed) continue;
    if (campaign.status && campaign.status !== "sent") continue;
    return parsed;
  }
  return null;
}
