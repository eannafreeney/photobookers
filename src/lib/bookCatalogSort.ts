import { desc } from "drizzle-orm";
import { books } from "../db/schema";

export type BookCatalogSort = "newest" | "trending";

export const BOOK_CATALOG_SORT_VALUES: BookCatalogSort[] = [
  "newest",
  "trending",
];

export const BOOK_CATALOG_SORT_LABELS: Record<BookCatalogSort, string> = {
  newest: "Newest",
  trending: "Trending",
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
    case "trending":
      return [desc(books.sortOrder), desc(books.id)];
    case "newest":
    default:
      return [desc(books.createdAt), desc(books.id)];
  }
};
