export const TRENDING_SLIDE_SIZE = 1080;

export type TrendingSlideKind = "books" | "artists" | "publishers";

export type TrendingSlideInput = {
  kind: TrendingSlideKind;
  rank: 1 | 2 | 3;
  title: string;
  subtitle?: string | null;
  coverUrl?: string | null;
};
