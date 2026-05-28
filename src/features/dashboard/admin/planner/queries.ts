import {
  ArtistOfTheWeekWithCreator,
  getArtistsOfTheWeekByWeekStart,
  getBotdByDate,
  getPublishersOfTheWeekByWeekStart,
  PublisherOfTheWeekWithCreator,
} from "./services";
import { db } from "../../../../db/client";
import {
  type NewsletterCampaignStatus,
  newsletterCampaigns,
} from "../../../../db/schema";
import { and, gte, lte } from "drizzle-orm";
import { getWeekStarts } from "./utils";
import { toWeekString } from "../../../../lib/utils";

export type PlannerYearData = {
  botdByDate: Awaited<ReturnType<typeof getBotdByDate>>;
  artistByWeekStart: Map<string, ArtistOfTheWeekWithCreator | null> | null;
  artistLoadError: string | null;
  publisherByWeekStart: Map<
    string,
    PublisherOfTheWeekWithCreator | null
  > | null;
  publisherLoadError: string | null;
  newsletterStatusByWeekStart: Map<string, NewsletterCampaignStatus | null>;
};

export const loadPlannerYearData = async (
  year: number,
): Promise<PlannerYearData> => {
  const [botdByDate, artistResult, publisherResult, newsletterStatusByWeekStart] =
    await Promise.all([
    getBotdByDate(year),
    getArtistsOfTheWeekByWeekStart(year),
    getPublishersOfTheWeekByWeekStart(year),
    getNewsletterStatusesByWeekStart(year),
  ]);

  const [artistErr, artistMap] = artistResult;
  const [publisherErr, publisherMap] = publisherResult;

  return {
    botdByDate,
    artistByWeekStart: artistErr ? null : artistMap,
    artistLoadError: artistErr?.reason ?? null,
    publisherByWeekStart: publisherErr ? null : publisherMap,
    publisherLoadError: publisherErr?.reason ?? null,
    newsletterStatusByWeekStart,
  };
};

const getNewsletterStatusesByWeekStart = async (
  year: number,
): Promise<Map<string, NewsletterCampaignStatus | null>> => {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return new Map();

  const first = weekStarts[0];
  const last = weekStarts[weekStarts.length - 1];
  const rows = await db.query.newsletterCampaigns.findMany({
    where: and(
      gte(newsletterCampaigns.weekStart, first),
      lte(newsletterCampaigns.weekStart, last),
    ),
  });

  const byWeek = new Map<string, NewsletterCampaignStatus | null>();
  for (const weekStart of weekStarts) {
    const weekKey = toWeekString(weekStart);
    const row = rows.find((entry) => toWeekString(entry.weekStart) === weekKey);
    byWeek.set(weekKey, row?.status ?? null);
  }
  return byWeek;
};
