/** Curated discover tags shown as horizontal book groups on the homepage. */
export const FEATURED_BOOK_GROUPS = [
  "japan",
  "urban",
  "africa",
  "street",
  "architecture",
  "europe",
  "asia",
  "america",
  "landscape",
  "nature",
] as const;

export type FeaturedBookGroupTag = (typeof FEATURED_BOOK_GROUPS)[number];
