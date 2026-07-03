/** Curated discover tags shown as horizontal book groups on /featured. */
export const FEATURED_BOOK_GROUPS = [
  "japan",
  "urban",
  "street",
  "architecture",
  "europe",
  "asia",
  "america",
  "landscape",
  "nature",
] as const;

export type FeaturedBookGroupTag = (typeof FEATURED_BOOK_GROUPS)[number];
