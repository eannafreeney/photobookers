import { asc, desc, sql } from "drizzle-orm";
import { bookViews, books } from "../db/schema";

export type BookCatalogSort = "newest" | "most_trending" | "least_trending";

export const BOOK_CATALOG_SORT_VALUES: BookCatalogSort[] = [
  "newest",
  "most_trending",
  "least_trending",
];

export const BOOK_CATALOG_SORT_LABELS: Record<BookCatalogSort, string> = {
  newest: "Newest",
  most_trending: "Most trending",
  least_trending: "Least trending",
};

export const parseBookCatalogSort = (
  value: string | null | undefined,
): BookCatalogSort | null => {
  if (!value) return null;
  return BOOK_CATALOG_SORT_VALUES.includes(value as BookCatalogSort)
    ? (value as BookCatalogSort)
    : null;
};

const bookViewCount = sql<number>`(
  SELECT COUNT(*)::int FROM ${bookViews}
  WHERE ${bookViews.bookId} = ${books.id}
)`;

export const getBookCatalogOrderBy = (sort: BookCatalogSort) => {
  switch (sort) {
    case "most_trending":
      return [desc(bookViewCount), desc(books.id)];
    case "least_trending":
      return [asc(bookViewCount), asc(books.id)];
    case "newest":
    default:
      return [desc(books.sortOrder), desc(books.id)];
  }
};
