import type { AnalyticsDateRange } from "../../features/book-analytics/dateRange";

export type DailyProductDigestTopBook = {
  title: string;
  slug: string;
  viewCount: number;
  artistName: string | null;
  publisherName: string | null;
};

export type DailyProductDigestTopCreator = {
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  viewCount: number;
};

export type DailyProductDigestGrowth = {
  newUsers: number;
  verifiedCreators: number;
  newBooks: number;
  newFavorites: number;
  newsletterSignups: number | null;
  outboundClicks: number;
};

export type DailyProductDigestTopClickedBook = {
  title: string;
  slug: string;
  clickCount: number;
  artistName: string | null;
  publisherName: string | null;
};

export type DailyProductDigestSnapshot = {
  range: AnalyticsDateRange;
  growth: DailyProductDigestGrowth;
  topBooksByViews: DailyProductDigestTopBook[];
  topBooksByClicks: DailyProductDigestTopClickedBook[];
  topArtistsByViews: DailyProductDigestTopCreator[];
  topPublishersByViews: DailyProductDigestTopCreator[];
};
