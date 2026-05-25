import {
  ArtistOfTheWeekWithCreator,
  getArtistsOfTheWeekByWeekStart,
  getBotdByDate,
  getPublishersOfTheWeekByWeekStart,
  PublisherOfTheWeekWithCreator,
} from "./services";

export type PlannerYearData = {
  botdByDate: Awaited<ReturnType<typeof getBotdByDate>>;
  artistByWeekStart: Map<string, ArtistOfTheWeekWithCreator | null> | null;
  artistLoadError: string | null;
  publisherByWeekStart: Map<
    string,
    PublisherOfTheWeekWithCreator | null
  > | null;
  publisherLoadError: string | null;
};

export const loadPlannerYearData = async (
  year: number,
): Promise<PlannerYearData> => {
  const [botdByDate, artistResult, publisherResult] = await Promise.all([
    getBotdByDate(year),
    getArtistsOfTheWeekByWeekStart(year),
    getPublishersOfTheWeekByWeekStart(year),
  ]);

  const [artistErr, artistMap] = artistResult;
  const [publisherErr, publisherMap] = publisherResult;

  return {
    botdByDate,
    artistByWeekStart: artistErr ? null : artistMap,
    artistLoadError: artistErr?.reason ?? null,
    publisherByWeekStart: publisherErr ? null : publisherMap,
    publisherLoadError: publisherErr?.reason ?? null,
  };
};
