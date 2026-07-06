import { desc } from "drizzle-orm";
import { books } from "../db/schema.js";
const BOOK_CATALOG_DEFAULT_SORT = "trending";
const BOOK_CATALOG_SORT_VALUES = [
  "newest",
  "trending"
];
const BOOK_CATALOG_SORT_LABELS = {
  newest: "Newest",
  trending: "Trending"
};
const parseBookCatalogSort = (value) => {
  if (!value) return null;
  return BOOK_CATALOG_SORT_VALUES.includes(value) ? value : null;
};
const getBookCatalogOrderBy = (sort) => {
  switch (sort) {
    case "trending":
      return [desc(books.sortOrder), desc(books.id)];
    case "newest":
    default:
      return [desc(books.createdAt), desc(books.id)];
  }
};
export {
  BOOK_CATALOG_DEFAULT_SORT,
  BOOK_CATALOG_SORT_LABELS,
  BOOK_CATALOG_SORT_VALUES,
  getBookCatalogOrderBy,
  parseBookCatalogSort
};
