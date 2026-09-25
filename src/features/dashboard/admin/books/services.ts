import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../../../../db/client";
import { bookViews, books, creators, purchaseClicks, wishlists } from "../../../../db/schema";
import type { AdminBookSort } from "./sort";
import { getPagination } from "../../../../lib/pagination";
import { err, ok } from "../../../../lib/result";
import { invalidateBookCache } from "../../../app/services";
import { sendEmail } from "../../../../lib/sendEmail";
import {
  generateBookApprovedEmail,
  generateBookFeedbackEmail,
  generateBookRejectedEmail,
} from "../creators/emails";
import {
  assignNextBookSortOrder,
  deleteBookDependents,
} from "../../books/services";
import { resolveBookSubmitterContact } from "./resolveBookSubmitterContact";

export const deleteBookByIdAdmin = async (bookId: string) => {
  try {
    await deleteBookDependents(bookId);

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

const adminBookWith = {
  bookOfTheDay: true,
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
} as const;

const orderIds = async (
  where: SQL | undefined,
  sort: AdminBookSort | null,
  limit: number,
  offset: number,
) => {
  const tie = asc(books.id);
  if (!sort) {
    return db
      .select({ id: books.id })
      .from(books)
      .where(where)
      .orderBy(desc(books.createdAt), tie)
      .limit(limit)
      .offset(offset);
  }

  if (sort.column === "title") {
    const titleOrder =
      sort.dir === "desc"
        ? sql`lower(${books.title}) DESC`
        : sql`lower(${books.title}) ASC`;
    return db
      .select({ id: books.id })
      .from(books)
      .where(where)
      .orderBy(titleOrder, tie)
      .limit(limit)
      .offset(offset);
  }

  if (sort.column === "releaseDate") {
    const dateOrder =
      sort.dir === "desc"
        ? sql`${books.releaseDate} DESC NULLS LAST`
        : sql`${books.releaseDate} ASC NULLS LAST`;
    return db
      .select({ id: books.id })
      .from(books)
      .where(where)
      .orderBy(dateOrder, tie)
      .limit(limit)
      .offset(offset);
  }

  if (sort.column === "artist" || sort.column === "publisher") {
    const creator = alias(
      creators,
      sort.column === "artist" ? "admin_book_artist" : "admin_book_publisher",
    );
    const fk = sort.column === "artist" ? books.artistId : books.publisherId;
    const nameOrder =
      sort.dir === "desc"
        ? sql`lower(${creator.displayName}) DESC NULLS LAST`
        : sql`lower(${creator.displayName}) ASC NULLS LAST`;
    return db
      .select({ id: books.id })
      .from(books)
      .leftJoin(creator, eq(fk, creator.id))
      .where(where)
      .orderBy(nameOrder, tie)
      .limit(limit)
      .offset(offset);
  }

  const metric =
    sort.column === "views"
      ? bookViews
      : sort.column === "favorites"
        ? wishlists
        : purchaseClicks;
  const metricCount = sql<number>`count(${metric.bookId})`;
  return db
    .select({ id: books.id })
    .from(books)
    .leftJoin(metric, eq(metric.bookId, books.id))
    .where(where)
    .groupBy(books.id)
    .orderBy(sort.dir === "desc" ? desc(metricCount) : asc(metricCount), tie)
    .limit(limit)
    .offset(offset);
};

export const getAllBooksAdmin = async (
  currentPage: number = 1,
  searchQuery?: string,
  status?: "approved" | "pending" | "rejected" | undefined,
  sort: AdminBookSort | null = null,
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

    const idRows = await orderIds(whereCondition, sort, limit, offset);
    const bookIds = idRows.map((row) => row.id);
    if (bookIds.length === 0) return ok({ books: [], totalPages, page });

    const foundBooks = await db.query.books.findMany({
      where: inArray(books.id, bookIds),
      with: adminBookWith,
    });
    const byId = new Map(foundBooks.map((book) => [book.id, book]));
    const ordered = bookIds
      .map((id) => byId.get(id))
      .filter((book) => book !== undefined);
    return ok({ books: ordered, totalPages, page });
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
  const { recipientEmail, displayName } = resolveBookSubmitterContact({
    artist: book.artist,
    publisher: book.publisher,
    notifyFollowersCreatorId: book.notifyFollowersCreatorId,
    artistId: book.artistId,
    creatorUser: book.creatorUser,
  });
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

    const siteUrl = (
      process.env.SITE_URL ?? "https://photobookers.com"
    ).replace(/\/$/, "");
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

export const unapproveBook = async (bookId: string) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ approvalStatus: "pending", publicationStatus: "draft" })
      .where(
        and(eq(books.id, bookId), eq(books.approvalStatus, "approved")),
      )
      .returning();
    if (!updatedBook) return err({ reason: "Book is not approved" });

    invalidateBookCache(updatedBook.slug);
    return ok(updatedBook);
  } catch (error) {
    return err({ reason: "Failed to unapprove book", cause: error });
  }
};

export const sendBookFeedback = async (bookId: string, feedback: string) => {
  try {
    const message = feedback.trim();
    if (!message) return err({ reason: "Feedback is required" });

    const contact = await getBookSubmitterContact(bookId);
    if (!contact) return err({ reason: "Book not found" });
    if (contact.book.approvalStatus !== "pending") {
      return err({ reason: "Feedback can only be sent for pending books" });
    }
    if (!contact.recipientEmail) {
      return err({ reason: "No recipient email found for this book" });
    }

    const [emailError] = await sendEmail(
      contact.recipientEmail,
      `Feedback on your book "${contact.book.title}"`,
      generateBookFeedbackEmail({
        creatorName: contact.displayName,
        bookTitle: contact.book.title,
        feedback: message,
      }),
    );
    if (emailError) return err(emailError);

    return ok(undefined);
  } catch (error) {
    return err({ reason: "Failed to send book feedback", cause: error });
  }
};
