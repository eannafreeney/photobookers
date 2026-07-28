export type BookCardBook = {
  date?: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  blurb?: string | null;
  artistName: string | null;
  publisherName: string | null;
};

export type CreatorCardCreator = {
  displayName: string;
  slug: string;
  coverUrl: string | null;
  blurb?: string | null;
};
