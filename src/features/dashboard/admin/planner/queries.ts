import {
  ArtistOfTheWeekWithCreator,
  getArtistsOfTheWeekByWeekStart,
  getBotdByDate,
  getPublishersOfTheWeekByWeekStart,
  PublisherOfTheWeekWithCreator,
} from "./services";
import { db } from "../../../../db/client";
import {
  type CreatorInterview,
  creatorInterviews,
  newsletterCampaigns,
} from "../../../../db/schema";
import { and, desc, gte, inArray, lte } from "drizzle-orm";
import { getWeekStarts } from "./utils";
import { getInstagramPreparedByWeekStart } from "./social-media/instagramServices";
import {
  mapPlannerNewsletterByWeekStart,
  type PlannerNewsletterWeekData,
} from "./newsletterPlanner";

export type PlannerYearData = {
  botdByDate: Awaited<ReturnType<typeof getBotdByDate>>;
  artistByWeekStart: Map<string, ArtistOfTheWeekWithCreator | null> | null;
  artistLoadError: string | null;
  publisherByWeekStart: Map<
    string,
    PublisherOfTheWeekWithCreator | null
  > | null;
  publisherLoadError: string | null;
  newsletterByWeekStart: Map<string, PlannerNewsletterWeekData>;
  instagramPreparedByWeekStart: Map<string, boolean>;
  /** Latest interview per creator featured in this year's planner */
  interviewByCreatorId: Map<string, CreatorInterview>;
};

export const loadPlannerYearData = async (
  year: number,
): Promise<PlannerYearData> => {
  const [
    botdByDate,
    artistResult,
    publisherResult,
    newsletterByWeekStart,
    instagramPreparedByWeekStart,
  ] = await Promise.all([
    getBotdByDate(year),
    getArtistsOfTheWeekByWeekStart(year),
    getPublishersOfTheWeekByWeekStart(year),
    getNewsletterStatusesByWeekStart(year),
    getInstagramPreparedByWeekStart(year),
  ]);

  const [artistErr, artistMap] = artistResult;
  const [publisherErr, publisherMap] = publisherResult;

  const interviewByCreatorId = await getInterviewsByCreatorIdForPlanner(
    artistErr ? undefined : (artistMap ?? undefined),
    publisherErr ? undefined : (publisherMap ?? undefined),
  );

  return {
    botdByDate,
    artistByWeekStart: artistErr ? null : artistMap,
    artistLoadError: artistErr?.reason ?? null,
    publisherByWeekStart: publisherErr ? null : publisherMap,
    publisherLoadError: publisherErr?.reason ?? null,
    newsletterByWeekStart,
    instagramPreparedByWeekStart,
    interviewByCreatorId,
  };
};

async function getInterviewsByCreatorIdForPlanner(
  artistMap: Map<string, ArtistOfTheWeekWithCreator | null> | undefined,
  publisherMap: Map<string, PublisherOfTheWeekWithCreator | null> | undefined,
): Promise<Map<string, CreatorInterview>> {
  const creatorIds = new Set<string>();

  for (const entry of artistMap?.values() ?? []) {
    if (entry?.creatorId) creatorIds.add(entry.creatorId);
  }
  for (const entry of publisherMap?.values() ?? []) {
    if (entry?.creatorId) creatorIds.add(entry.creatorId);
  }

  if (creatorIds.size === 0) return new Map();

  const rows = await db.query.creatorInterviews.findMany({
    where: inArray(creatorInterviews.creatorId, [...creatorIds]),
    orderBy: [desc(creatorInterviews.invitedAt)],
  });

  const byCreatorId = new Map<string, CreatorInterview>();
  for (const row of rows) {
    if (!byCreatorId.has(row.creatorId)) {
      byCreatorId.set(row.creatorId, row);
    }
  }

  return byCreatorId;
}

const getNewsletterStatusesByWeekStart = async (
  year: number,
): Promise<Map<string, PlannerNewsletterWeekData>> => {
  const weekStarts = getWeekStarts(year);
  if (weekStarts.length === 0) return new Map();

  const first = weekStarts[0];
  const last = weekStarts[weekStarts.length - 1];
  const lastSunday = new Date(last);
  lastSunday.setUTCDate(lastSunday.getUTCDate() + 6);
  const rows = await db.query.newsletterCampaigns.findMany({
    where: and(
      gte(newsletterCampaigns.weekStart, first),
      lte(newsletterCampaigns.weekStart, lastSunday),
    ),
  });
  return mapPlannerNewsletterByWeekStart(weekStarts, rows);
};
