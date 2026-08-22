import { count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../../../../db/client";
import { bookComments, books, users } from "../../../../db/schema";
import { getPagination } from "../../../../lib/pagination";
import { err, ok } from "../../../../lib/result";

export const getAdminComments = async (
  currentPage: number = 1,
  searchQuery?: string,
) => {
  try {
    const normalizedSearch = searchQuery?.trim();
    const hasSearch = !!normalizedSearch;

    let bookIds: string[] = [];
    let userIds: string[] = [];
    if (hasSearch) {
      const bookRows = await db
        .select({ id: books.id })
        .from(books)
        .where(ilike(books.title, `%${normalizedSearch}%`));
      bookIds = bookRows.map((r) => r.id);

      const userRows = await db
        .select({ id: users.id })
        .from(users)
        .where(
          or(
            ilike(users.email, `%${normalizedSearch}%`),
            ilike(users.firstName, `%${normalizedSearch}%`),
            ilike(users.lastName, `%${normalizedSearch}%`),
          ),
        );
      userIds = userRows.map((r) => r.id);
    }

    const whereCondition = hasSearch
      ? or(
          ilike(bookComments.body, `%${normalizedSearch}%`),
          bookIds.length > 0
            ? inArray(bookComments.bookId, bookIds)
            : undefined,
          userIds.length > 0
            ? inArray(bookComments.userId, userIds)
            : undefined,
        )
      : undefined;

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(bookComments)
      .where(whereCondition);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      30,
    );

    const comments = await db.query.bookComments.findMany({
      where: whereCondition,
      orderBy: [desc(bookComments.createdAt)],
      with: {
        book: {
          columns: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      limit,
      offset,
    });

    return ok({ comments, page, totalPages });
  } catch (error) {
    console.error("Failed to get admin comments", error);
    return err({ reason: "Failed to get admin comments", cause: error });
  }
};

export const getAdminCommentById = async (commentId: string) => {
  try {
    const comment = await db.query.bookComments.findFirst({
      where: eq(bookComments.id, commentId),
      with: {
        book: {
          columns: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!comment) return err({ reason: "Comment not found" });
    return ok(comment);
  } catch (error) {
    console.error("Failed to get admin comment by id", error);
    return err({ reason: "Failed to get admin comment by id", cause: error });
  }
};
