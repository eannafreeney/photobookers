export type WeeklyNewsletterBookItem = {
  date?: string;
  bookId: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  blurb: string | null;
  artistName: string | null;
  artistSlug: string | null;
  publisherName: string | null;
  publisherSlug: string | null;
};

export type WeeklyNewsletterCreatorSpotlight = {
  displayName: string;
  slug: string;
  /** ISO week key for `/artist-of-the-week/:week` and `/publisher-of-the-week/:week`. */
  weekKey: string;
  coverUrl: string | null;
  tagline: string | null;
  blurb: string | null;
  location: string | null;
} | null;

export type WeeklyNewsletterNewMember = {
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  coverUrl: string | null;
  tagline: string | null;
  location: string | null;
};

export type WeeklyNewsletterFairItem = {
  name: string;
  slug: string;
  coverUrl: string | null;
  venue: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
};

export type WeeklyNewsletterTrendingBookItem = {
  bookId: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  artistName: string | null;
  publisherName: string | null;
};

export type WeeklyNewsletterTrendingCreatorItem = {
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  coverUrl: string | null;
};

export type WeeklyNewsletterGeneratedContent = {
  generatedAt: string;
  botdEntries: WeeklyNewsletterBookItem[];
  newMembers: WeeklyNewsletterNewMember[];
  upcomingFair: WeeklyNewsletterFairItem | null;
  artistOfTheWeek: WeeklyNewsletterCreatorSpotlight;
  publisherOfTheWeek: WeeklyNewsletterCreatorSpotlight;
  trending?: WeeklyNewsletterTrending;
};

export type WeeklyNewsletterTrending = {
  books: WeeklyNewsletterTrendingBookItem[];
  artists: WeeklyNewsletterTrendingCreatorItem[];
  publishers: WeeklyNewsletterTrendingCreatorItem[];
};

export type WeeklyNewsletterRenderParams = {
  weekStart: Date;
  weekEnd: Date;
  subject: string;
  introText: string;
  outroText: string;
  ctaText: string;
  botdEntries: WeeklyNewsletterBookItem[];
  newMembers?: WeeklyNewsletterNewMember[];
  upcomingFair?: WeeklyNewsletterFairItem | null;
  artistOfTheWeek: WeeklyNewsletterCreatorSpotlight;
  publisherOfTheWeek: WeeklyNewsletterCreatorSpotlight;
  trending?: WeeklyNewsletterTrending;
};
