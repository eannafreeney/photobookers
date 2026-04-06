import { Book, Creator } from "../db/schema";

export type CreatorCardResult = Pick<
  Creator,
  keyof typeof CREATOR_CARD_COLUMNS
>;

export const CREATOR_CARD_COLUMNS = {
  id: true,
  displayName: true,
  slug: true,
  coverUrl: true,
  status: true,
  type: true,
  city: true,
  country: true,
  tagline: true,
  email: true,
} as const;

export type BookCardResult = Pick<Book, keyof typeof BOOK_CARD_COLUMNS> & {
  artist?: CreatorCardResult | null;
  publisher?: CreatorCardResult | null;
};

export const BOOK_CARD_COLUMNS = {
  id: true,
  title: true,
  slug: true,
  coverUrl: true,
  artistId: true,
  publisherId: true,
  releaseDate: true,
  tags: true,
  createdByUserId: true,
} as const;
