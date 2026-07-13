import { Creator, CreatorMessage } from "../../db/schema";
import { BookCardResult } from "../../constants/queries";

export type FeedBook = BookCardResult & { createdAt: Date | null };

export type FeedMessage = CreatorMessage & {
  creator: Pick<Creator, "id" | "displayName" | "slug" | "coverUrl">;
};

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

export type FeedItem = FeedBookItem | FeedMessageItem;

export const bookSortDate = (book: FeedBook): Date =>
  book.releaseDate ?? book.createdAt ?? new Date(0);

export const messageSortDate = (message: FeedMessage): Date =>
  message.createdAt ?? new Date(0);

const compareFeedItems = (a: FeedItem, b: FeedItem): number => {
  const byDate = b.sortDate.getTime() - a.sortDate.getTime();
  if (byDate !== 0) return byDate;
  if (a.kind !== b.kind) return a.kind === "message" ? -1 : 1;
  const aId = a.kind === "book" ? a.book.id : a.message.id;
  const bId = b.kind === "book" ? b.book.id : b.message.id;
  return bId.localeCompare(aId);
};

/** ponytail: merge pre-fetched books/messages, then slice for page — upgrade path is SQL UNION ALL */
export const mergeFeedItems = (
  books: FeedBook[],
  messages: FeedMessage[],
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
  ];

  items.sort(compareFeedItems);

  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
};
