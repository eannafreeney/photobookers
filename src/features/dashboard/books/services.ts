import { and, count, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../../../db/client";
import {
  Book,
  bookImages,
  books,
  Creator,
  creators,
  NewBook,
  UpdateBook,
} from "../../../db/schema";
import { generateUniqueBookSlug } from "../../../utils";
import z from "zod";
import { bookFormSchema } from "./schema";
import { processTags } from "./utils";
import { getPagination } from "../../../lib/pagination";
import { bookFormAdminSchema } from "../admin/books/schema";
import { err, ok } from "../../../lib/result";

export const createBook = async (input: NewBook) => {
  try {
    const [newBook] = await db.insert(books).values(input).returning();
    return newBook;
  } catch (error) {
    console.error("Failed to create book", error);
    return null;
  }
};

export const getBooksByArtistId = async (
  artistId: string,
  currentPage: number,
  searchTerm?: string,
  defaultLimit = 30,
) => {
  const baseFilter = eq(books.artistId, artistId);
  const titleFilter = searchTerm?.trim()
    ? ilike(books.title, `%${searchTerm.trim()}%`)
    : undefined;

  const whereClause = titleFilter ? and(baseFilter, titleFilter) : baseFilter;

  try {
    const countResult = await db
      .select({ value: count() })
      .from(books)
      .leftJoin(creators, eq(books.publisherId, creators.id))
      .where(whereClause);

    const totalCount = Number(countResult[0]?.value ?? 0);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const artistBookIdsSubquery = db
      .select({ id: books.id })
      .from(books)
      .leftJoin(creators, eq(books.publisherId, creators.id))
      .where(whereClause);

    const booksByArtist = await db.query.books.findMany({
      where: inArray(books.id, artistBookIdsSubquery),
      orderBy: (books, { desc }) => [desc(books.createdAt)],
      with: { artist: true, publisher: true },
      limit,
      offset,
    });

    return ok({ books: booksByArtist, totalPages, page });
  } catch (error) {
    console.error("Failed to get books by artist", error);
    return err({ reason: "Failed to get books by artist" });
  }
};

export const getBooksByPublisherId = async (
  publisherId: string,
  currentPage: number,
  searchTerm?: string,
  defaultLimit = 30,
) => {
  const baseFilter = eq(books.publisherId, publisherId);
  const titleFilter = searchTerm?.trim()
    ? ilike(books.title, `%${searchTerm.trim()}%`)
    : undefined;

  const whereClause = titleFilter ? and(baseFilter, titleFilter) : baseFilter;

  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(whereClause);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const booksByPublisher = await db.query.books.findMany({
      where: whereClause,
      orderBy: (books, { desc }) => [desc(books.createdAt)],
      with: {
        artist: true,
        publisher: true,
      },
      limit,
      offset,
    });

    return ok({ books: booksByPublisher, totalPages, page });
  } catch (error) {
    console.error("Failed to get books by creator", error);
    return err({ reason: "Failed to get books by creator" });
  }
};

export const getBookById = async (bookId: string) => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: {
        publisher: true,
        artist: true,
        bookOfTheWeekEntry: true,
        images: {
          orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
        },
      },
    });
    if (!book) return err({ reason: "Book not found" });
    return ok(book);
  } catch (error) {
    console.error("Failed to get book by id", error);
    return err({ reason: "Failed to get book by id" });
  }
};

export const updateBook = async (input: UpdateBook, bookId: string) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set(input)
      .where(eq(books.id, bookId))
      .returning();

    return updatedBook;
  } catch (error) {
    console.error("Failed to update book", error);
    return null;
  }
};

export const deleteBookById = async (bookId: string) => {
  try {
    const [book] = await db.select().from(books).where(eq(books.id, bookId));

    if (!book) return null;

    // Delete related book_images first (FK constraint)
    await db.delete(bookImages).where(eq(bookImages.bookId, bookId));

    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();

    // Clean up orphaned stub publisher
    if (book.publisherId) {
      await cleanupOrphanedStubCreator(book.publisherId);
    }

    // Clean up orphaned stub artist
    if (book.artistId) {
      await cleanupOrphanedStubCreator(book.artistId);
    }

    return deletedBook;
  } catch (error) {
    console.error("Failed to delete book", error);
    return null;
  }
};

export async function cleanupOrphanedStubCreator(creatorId: string) {
  const [creator] = await db
    .select()
    .from(creators)
    .where(eq(creators.id, creatorId));

  // Only delete if it's a stub
  if (creator?.status !== "stub") return;

  // Check if creator has any other books
  const otherBooks = await db
    .select({ id: books.id })
    .from(books)
    .where(or(eq(books.artistId, creatorId), eq(books.publisherId, creatorId)))
    .limit(1);

  // If no other books, delete the stub
  if (otherBooks.length === 0) {
    await db.delete(creators).where(eq(creators.id, creatorId));
  }
}

export const buildCreateBookData = async (
  formData:
    | z.infer<typeof bookFormSchema>
    | z.infer<typeof bookFormAdminSchema>,
  bookCreator: Creator,
  userId: string,
  bookPublisher?: Creator | null,
): Promise<NewBook> => {
  const shouldNotify =
    !!formData.send_email_to_followers_on_release && !!formData.release_date;

  return {
    title: formData.title,
    description: formData.description || null,
    releaseDate: formData.release_date ? new Date(formData.release_date) : null,
    slug: await generateUniqueBookSlug(
      formData.title,
      bookCreator?.displayName,
    ),
    artistId: bookCreator?.id ?? null,
    publisherId: bookPublisher?.id ?? null,
    createdByUserId: userId,
    tags: processTags(formData.tags),
    purchaseLink: formData.purchase_link ?? null,
    approvalStatus: "approved",
    publicationStatus: "draft",
    availabilityStatus: formData.availability_status,
    notifyFollowersOnRelease: shouldNotify,
    notifyFollowersScheduledDate: shouldNotify
      ? new Date(formData.release_date ?? "")
      : null,
    notifyFollowersSentAt: null,
    notifyFollowersCreatorId: bookCreator?.id ?? null,
  };
};

export const buildUpdateBookData = (
  formData:
    | z.infer<typeof bookFormSchema>
    | z.infer<typeof bookFormAdminSchema>,
  artistId?: string,
  publisherId?: string,
): UpdateBook => {
  return {
    title: formData.title,
    description: formData.description || null,
    releaseDate: formData.release_date ? new Date(formData.release_date) : null,
    purchaseLink: formData.purchase_link ?? null,
    tags: processTags(formData.tags),
    availabilityStatus: formData.availability_status,
    artistId,
    publisherId,
  };
};

export const updateBookPublicationStatus = async (
  bookId: string,
  publicationStatus: "published" | "draft",
): Promise<
  { success: true; book: Book } | { success: false; error: string }
> => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ publicationStatus })
      .where(eq(books.id, bookId))
      .returning();
    return { success: true, book: updatedBook };
  } catch (error: unknown) {
    console.error("Failed to update book publication status", error);

    // Check for cover constraint violation
    if (
      (error as any).cause?.constraint_name === "cover_required_for_publish"
    ) {
      return { success: false, error: "Add a cover image before publishing" };
    }

    return { success: false, error: "Failed to update book mode" };
  }
};

export const getBooksForStubPublishersByCreatorId = async (
  creatorId: string,
) => {
  if (!creatorId) return [];

  const stubPublishersWithBooks = await db.query.creators.findMany({
    where: and(eq(creators.status, "stub"), ne(creators.id, creatorId)),
    with: {
      booksAsPublisher: {
        where: eq(books.artistId, creatorId),
      },
    },
  });
  return stubPublishersWithBooks.flatMap((c) => c.booksAsPublisher);
};
