import { and, count, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "../../../../db/client";
import { books, creators } from "../../../../db/schema";
import { getPagination } from "../../../../lib/pagination";
import { err, ok } from "../../../../lib/result";
import { invalidateBookCache } from "../../../app/services";
import { sendEmail } from "../../../../lib/sendEmail";
import {
  generateBookApprovedEmail,
  generateBookRejectedEmail,
} from "../creators/emails";
import { assignNextBookSortOrder } from "../../books/services";

export const deleteBookByIdAdmin = async (bookId: string) => {
  try {
    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();
    if (!deletedBook) return err({ reason: "Book not found" });

    if (deletedBook?.slug) {
      invalidateBookCache(deletedBook.slug);
    }

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

const getBookSubmitterContact = async (bookId: string) => {
  const book = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    with: {
      creatorUser: {
        // this is the createdByUserId relation
        columns: { email: true, firstName: true, lastName: true },
      },
      artist: {
        columns: { displayName: true, email: true },
      },
      publisher: {
        columns: { displayName: true, email: true },
      },
    },
  });
  if (!book) return null;
  // Prefer the creator profile's email if set, fall back to the user account email
  const submittingCreator =
    book.notifyFollowersCreatorId === book.artistId
      ? book.artist
      : book.publisher;
  const recipientEmail =
    submittingCreator?.email ?? book.creatorUser?.email ?? null;
  const displayName =
    submittingCreator?.displayName ??
    [book.creatorUser?.firstName, book.creatorUser?.lastName]
      .filter(Boolean)
      .join(" ") ??
    "there";
  return { recipientEmail, displayName, book };
};

export const approveBook = async (bookId: string) => {
  try {
    const nextSort = await assignNextBookSortOrder();

    const [updatedBook] = await db
      .update(books)
      .set({ approvalStatus: "approved", sortOrder: nextSort })
      .where(eq(books.id, bookId))
      .returning();
    if (!updatedBook) return err({ reason: "Book not found" });

    const siteUrl = (process.env.SITE_URL ?? "https://photobookers.com").replace(
      /\/$/,
      "",
    );
    const dashboardBookUrl = `${siteUrl}/dashboard/books/${updatedBook.id}`;

    const contact = await getBookSubmitterContact(bookId);
    if (contact?.recipientEmail) {
      const html = generateBookApprovedEmail({
        creatorName: contact.displayName,
        bookTitle: updatedBook.title,
        dashboardBookUrl,
      });
      await sendEmail(
        contact.recipientEmail,
        `Your book "${updatedBook.title}" has been approved`,
        html,
      );
    }

    return ok(updatedBook);
  } catch (error) {
    return err({ reason: "Failed to approve book", cause: error });
  }
};

export const rejectBook = async (bookId: string, feedback?: string) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ approvalStatus: "rejected", publicationStatus: "draft" })
      .where(eq(books.id, bookId))
      .returning();
    if (!updatedBook) return err({ reason: "Book not found" });

    const contact = await getBookSubmitterContact(bookId);
    if (contact?.recipientEmail) {
      const html = generateBookRejectedEmail({
        creatorName: contact.displayName,
        bookTitle: updatedBook.title,
        feedback: feedback ?? "",
      });
      await sendEmail(
        contact.recipientEmail,
        `Feedback on your book "${updatedBook.title}"`,
        html,
      );
    }

    return ok(updatedBook);
  } catch (error) {
    return err({ reason: "Failed to reject book", cause: error });
  }
};
