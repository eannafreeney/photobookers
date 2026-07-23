import { CollectorPost, Creator, CreatorMessage } from "../../db/schema";
import { BookCardResult } from "../../constants/queries";

export type FeedBook = BookCardResult & { createdAt: Date | null };

export type FeedMessage = CreatorMessage & {
  creator: Pick<Creator, "id" | "displayName" | "slug" | "coverUrl">;
};

export type FeedPostAuthor = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  shelfSlug: string | null;
  profileImageUrl: string | null;
};

export type FeedPost = CollectorPost & { author: FeedPostAuthor };

export type FeedBookItem = {
  kind: "book";
  sortDate: Date;
  book: FeedBook;
};

export type FeedMessageItem = {
  kind: "message";
  sortDate: Date;
  message: FeedMessage;
};

export type FeedPostItem = {
  kind: "post";
  sortDate: Date;
  post: FeedPost;
};

export type FeedItem = FeedBookItem | FeedMessageItem | FeedPostItem;

export const bookSortDate = (book: FeedBook): Date =>
  book.releaseDate ?? book.createdAt ?? new Date(0);

export const messageSortDate = (message: FeedMessage): Date =>
  message.createdAt ?? new Date(0);

export const postSortDate = (post: FeedPost): Date =>
  post.createdAt ?? new Date(0);

// Lower rank sorts first when two items share a timestamp.
const kindRank: Record<FeedItem["kind"], number> = {
  message: 0,
  post: 1,
  book: 2,
};

const itemId = (item: FeedItem): string =>
  item.kind === "book"
    ? item.book.id
    : item.kind === "message"
      ? item.message.id
      : item.post.id;

const compareFeedItems = (a: FeedItem, b: FeedItem): number => {
  const byDate = b.sortDate.getTime() - a.sortDate.getTime();
  if (byDate !== 0) return byDate;
  if (a.kind !== b.kind) return kindRank[a.kind] - kindRank[b.kind];
  return itemId(b).localeCompare(itemId(a));
};

/** ponytail: merge pre-fetched books/messages/posts, then slice for page — upgrade path is SQL UNION ALL */
export const mergeFeedItems = (
  books: FeedBook[],
  messages: FeedMessage[],
  posts: FeedPost[],
  page: number,
  limit: number,
): FeedItem[] => {
  const items: FeedItem[] = [
    ...books.map(
      (book): FeedBookItem => ({
        kind: "book",
        sortDate: bookSortDate(book),
        book,
      }),
    ),
    ...messages.map(
      (message): FeedMessageItem => ({
        kind: "message",
        sortDate: messageSortDate(message),
        message,
      }),
    ),
    ...posts.map(
      (post): FeedPostItem => ({
        kind: "post",
        sortDate: postSortDate(post),
        post,
      }),
    ),
  ];

  items.sort(compareFeedItems);

  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
};
