import { count, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../../../../db/client";
import { books, creators } from "../../../../db/schema";
import { BookWithAdminRelations } from "./types";
import { getPagination } from "../../../../lib/pagination";

export const deleteBookByIdAdmin = async (bookId: string) => {
  try {
    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();
    return deletedBook;
  } catch (error) {
    console.error("Failed to delete book", error);
    return null;
  }
};

export const getAllBooksAdmin = async (
  currentPage: number = 1,
  searchQuery?: string,
  defaultLimit = 30,
): Promise<{
  books: BookWithAdminRelations[];
  totalPages: number;
  page: number;
}> => {
  let creatorIds: string[] = [];
  if (searchQuery) {
    const rows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(ilike(creators.displayName, `%${searchQuery}%`));
    creatorIds = rows.map((r) => r.id);
  }

  const whereCondition =
    searchQuery && searchQuery.trim() !== ""
      ? creatorIds.length > 0
        ? or(
            ilike(books.title, `%${searchQuery}%`),
            inArray(books.artistId, creatorIds),
            inArray(books.publisherId, creatorIds),
          )
        : ilike(books.title, `%${searchQuery}%`)
      : undefined;

  const [{ value: totalCount = 0 }] = await db
    .select({ value: count() })
    .from(books)
    .where(whereCondition);

  const { page, limit, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    defaultLimit,
  );

  const foundBooks = await db.query.books.findMany({
    where: whereCondition,
    orderBy: (books, { desc }) => [desc(books.createdAt)],
    limit: limit,
    offset: offset,
    with: {
      bookOfTheWeekEntry: true,
      artist: {
        columns: {
          id: true,
          displayName: true,
          slug: true,
        },
      },
      publisher: {
        columns: {
          id: true,
          displayName: true,
          slug: true,
        },
      },
    },
  });
  return { books: foundBooks, totalPages, page };
};
