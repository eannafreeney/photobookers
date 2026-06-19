import { desc } from "drizzle-orm";
import { books } from "../db/schema";

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

export const getBookCatalogOrderBy = (sort: BookCatalogSort) => {
  switch (sort) {
    case "most_trending":
    case "least_trending":
      // View-based sorts use findCatalogBooks() in services.ts (join query).
      return [desc(books.sortOrder), desc(books.id)];
    case "newest":
    default:
      return [desc(books.sortOrder), desc(books.id)];
  }
};
