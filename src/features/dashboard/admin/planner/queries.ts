import {
  ArtistOfTheWeekWithCreator,
  getArtistsOfTheWeekByWeekStart,
  getBotdByDate,
  getPublishersOfTheWeekByWeekStart,
  PublisherOfTheWeekWithCreator,
} from "./services";
import { db } from "../../../../db/client";
import { type CreatorInterview, creatorInterviews } from "../../../../db/schema";
import { desc, inArray } from "drizzle-orm";
import { getInstagramPreparedByWeekStart } from "./social-media/instagramServices";

export type PlannerYearData = {
  botdByDate: Awaited<ReturnType<typeof getBotdByDate>>;
  artistByWeekStart: Map<string, ArtistOfTheWeekWithCreator | null> | null;
  artistLoadError: string | null;
  publisherByWeekStart: Map<
    string,
    PublisherOfTheWeekWithCreator | null
  > | null;
  publisherLoadError: string | null;
  instagramPreparedByWeekStart: Map<string, boolean>;
  /** Latest interview per creator featured in this year's planner */
  interviewByCreatorId: Map<string, CreatorInterview>;
};

export const loadPlannerYearData = async (
  year: number,
): Promise<PlannerYearData> => {
  const [botdByDate, artistResult, publisherResult, instagramPreparedByWeekStart] =
    await Promise.all([
      getBotdByDate(year),
      getArtistsOfTheWeekByWeekStart(year),
      getPublishersOfTheWeekByWeekStart(year),
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
