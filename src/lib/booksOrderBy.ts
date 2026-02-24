import { asc, desc } from "drizzle-orm";
import { books } from "../db/schema";

export type BookSortBy = "newest" | "oldest" | "title_asc" | "title_desc";

/** Columns shape passed to orderBy callback in db.query.books.findMany (fields, not table). */
type BooksOrderByFields = {
  createdAt: typeof books.createdAt;
  title: typeof books.title;
};

export function getBooksOrderBy(sortBy: BookSortBy) {
  return (
    fields: BooksOrderByFields,
    { asc: a, desc: d }: { asc: typeof asc; desc: typeof desc },
  ) => {
    switch (sortBy) {
      case "newest":
        return [d(fields.createdAt)];
      case "oldest":
        return [a(fields.createdAt)];
      case "title_asc":
        return [a(fields.title)];
      case "title_desc":
        return [d(fields.title)];
      default:
        return [a(fields.title)];
    }
  };
}
