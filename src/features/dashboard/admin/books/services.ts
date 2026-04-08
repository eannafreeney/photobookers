import { and, count, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../../../../db/client";
import { books, creators } from "../../../../db/schema";
import { getPagination } from "../../../../lib/pagination";
import { err, ok } from "../../../../lib/result";

export const deleteBookByIdAdmin = async (bookId: string) => {
  try {
    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();
    if (!deletedBook) return err({ reason: "Book not found" });
    return ok(deletedBook);
  } catch (error) {
    console.error("Failed to delete book", error);
    return err({ reason: "Failed to delete book", cause: error });
  }
};

export const getAllBooksAdmin = async (
  currentPage: number = 1,
  searchQuery?: string,
  status?: "approved" | "pending" | "rejected" | undefined,
) => {
  try {
    let creatorIds: string[] = [];
    if (searchQuery) {
      const rows = await db
        .select({ id: creators.id })
        .from(creators)
        .where(ilike(creators.displayName, `%${searchQuery}%`));
      creatorIds = rows.map((r) => r.id);
    }

    const searchCondition =
      searchQuery && searchQuery.trim() !== ""
        ? creatorIds.length > 0
          ? or(
              ilike(books.title, `%${searchQuery}%`),
              inArray(books.artistId, creatorIds),
              inArray(books.publisherId, creatorIds),
            )
          : ilike(books.title, `%${searchQuery}%`)
        : undefined;

    const statusCondition = status
      ? eq(books.approvalStatus, status)
      : undefined;

    const whereCondition =
      searchCondition && statusCondition
        ? and(searchCondition, statusCondition)
        : (searchCondition ?? statusCondition ?? undefined);

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(whereCondition);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      30,
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
    if (foundBooks.length === 0) return err({ reason: "No books found" });
    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get all books", error);
    return err({ reason: "Failed to get all books", cause: error });
  }
};
