import {
  ArtistOfTheWeekWithCreator,
  getArtistsOfTheWeekByWeekStart,
  getBotwByWeekStart,
  getFeaturedBooksByWeekStart,
  getPublishersOfTheWeekByWeekStart,
  PublisherOfTheWeekWithCreator,
} from "./services";

export type PlannerYearData = {
  botwByWeekStart: Awaited<ReturnType<typeof getBotwByWeekStart>>;
  featuredByWeekStart: Awaited<ReturnType<typeof getFeaturedBooksByWeekStart>>;
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
  const [botwByWeekStart, featuredByWeekStart, artistResult, publisherResult] =
    await Promise.all([
      getBotwByWeekStart(year),
      getFeaturedBooksByWeekStart(year),
      getArtistsOfTheWeekByWeekStart(year),
      getPublishersOfTheWeekByWeekStart(year),
    ]);

  const [artistErr, artistMap] = artistResult;
  const [publisherErr, publisherMap] = publisherResult;

  return {
    botwByWeekStart,
    featuredByWeekStart,
    artistByWeekStart: artistErr ? null : artistMap,
    artistLoadError: artistErr?.reason ?? null,
    publisherByWeekStart: publisherErr ? null : publisherMap,
    publisherLoadError: publisherErr?.reason ?? null,
  };
};
