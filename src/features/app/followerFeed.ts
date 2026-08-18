import { CollectorPost, Creator } from "../../db/schema";
import { BookCardResult } from "../../constants/queries";

export type FeedTab = "posts" | "books";

export const parseFeedTab = (raw: string | undefined): FeedTab =>
  raw === "books" ? "books" : "posts";

export type FeedBook = BookCardResult & { createdAt: Date | null };

export type FeedPostAuthor = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  shelfSlug: string | null;
  profileImageUrl: string | null;
};

export type FeedPostCreator = Pick<
  Creator,
  "id" | "displayName" | "slug" | "coverUrl"
>;

export type FeedPost = CollectorPost & {
  author: FeedPostAuthor;
  creator?: FeedPostCreator;
};

export type FeedBookItem = {
  kind: "book";
  book: FeedBook;
};

export type FeedPostItem = {
  kind: "post";
  post: FeedPost;
};

export type FeedItem = FeedBookItem | FeedPostItem;
