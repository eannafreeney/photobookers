import { desc, sql } from "drizzle-orm";
import { books } from "../db/schema";

export type BookCatalogSort = "newest" | "trending" | "latest";

export const BOOK_CATALOG_DEFAULT_SORT: BookCatalogSort = "trending";

export const BOOK_CATALOG_SORT_VALUES: BookCatalogSort[] = [
  "newest",
  "trending",
  "latest",
];

export const BOOK_CATALOG_SORT_LABELS: Record<BookCatalogSort, string> = {
  newest: "Newest",
  trending: "Trending",
  latest: "Latest",
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
    case "latest":
      return [desc(books.createdAt), desc(books.id)];
    case "newest":
    default:
      // Match getBooksOrderBy("newest"): release date first, not draft createdAt.
      return [
        sql`${books.releaseDate} DESC NULLS LAST`,
        desc(books.createdAt),
        desc(books.id),
      ];
  }
};
