import { and, count, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/client";
import { books, creators } from "../../db/schema";
import { getPagination } from "../../lib/pagination";
import { err, ok } from "../../lib/result";

export const getBooksByCreatorId = async (
  creatorId: string,
  currentPage: number,
  searchQuery?: string,
  defaultLimit = 3,
) => {
  const baseFilter = or(
    eq(books.artistId, creatorId),
    eq(books.publisherId, creatorId),
  );
  const titleFilter = searchQuery?.trim()
    ? ilike(books.title, `%${searchQuery.trim()}%`)
    : undefined;

  const whereClause = titleFilter ? and(baseFilter, titleFilter) : baseFilter;

  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
    });
    if (!creator) return err({ reason: "Creator not found" });

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(whereClause);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundBooks = await db.query.books.findMany({
      where: whereClause,
      orderBy: (booksTable, { desc }) => [desc(booksTable.createdAt)],
      with: {
        artist: true,
        publisher: true,
      },
      limit,
      offset,
    });

    if (foundBooks.length === 0)
      return ok({ books: [], totalPages, page, creator });

    return ok({ books: foundBooks, totalPages, page, creator });
  } catch (error) {
    console.error("Failed to get books by creator id", error);
    return err({ reason: "Failed to get books by creator id", cause: error });
  }
};
