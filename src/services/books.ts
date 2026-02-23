import { db } from "../db/client";
import {
  Book,
  bookImages,
  books,
  Creator,
  creators,
  follows,
  NewBook,
  UpdateBook,
  wishlists,
} from "../db/schema";
import {
  and,
  count,
  eq,
  exists,
  ilike,
  inArray,
  isNull,
  lte,
  ne,
  not,
  or,
  sql,
} from "drizzle-orm";
import { generateUniqueBookSlug, slugify } from "../utils";
import { bookFormSchema } from "../schemas";
import z from "zod";
import { AuthUser } from "../../types";
import { getPagination } from "../lib/pagination";

export const getNewBooks = async (currentPage: number, defaultLimit = 12) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(eq(books.publicationStatus, "published"));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundBooks = await db.query.books.findMany({
      with: {
        artist: true,
        images: {
          orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
        },
      },
      orderBy: (books, { desc }) => [desc(books.createdAt)],
      where: and(
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        // lte(books.releaseDate, new Date()),
      ),
      limit: limit,
      offset: offset,
    });
    return { books: foundBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books", error);
    return null;
  }
};

export const getBooksByTag = async (
  tag: string,
  currentPage: number,
  defaultLimit = 12,
) => {
  try {
    const tagCondition = sql`EXISTS (
      SELECT 1 FROM unnest(${books.tags}) AS t
      WHERE LOWER(t) = LOWER(${tag})
    )`;

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(and(eq(books.publicationStatus, "published"), tagCondition));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundBooks = await db.query.books.findMany({
      where: (books, { and, eq, sql }) =>
        and(
          eq(books.publicationStatus, "published"),
          sql`EXISTS (
            SELECT 1 FROM unnest(${books.tags}) AS t
            WHERE LOWER(t) = LOWER(${tag})
          )`,
        ),
      with: {
        artist: true,
        publisher: true,
      },
      orderBy: (books, { desc }) => [desc(books.releaseDate)],
      limit: limit,
      offset: offset,
    });
    return { books: foundBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books by tag", error);
    return null;
  }
};

export const getBooksByCreatorId = async (
  creatorId: string,
  creatorType: "artist" | "publisher",
  currentPage: number,
  searchQuery?: string,
  defaultLimit = 30,
) => {
  const bookColumn =
    creatorType === "artist" ? books.artistId : books.publisherId;
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(
        and(
          eq(bookColumn, creatorId),
          eq(books.publicationStatus, "published"),
        ),
      );

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const baseCondition = and(
      eq(bookColumn, creatorId),
      eq(books.publicationStatus, "published"),
    );

    const whereClause = searchQuery
      ? and(baseCondition, ilike(books.title, `%${searchQuery}%`))
      : baseCondition;

    const booksByCreator = await db.query.books.findMany({
      where: whereClause,
      orderBy: (books, { desc }) => [desc(books.createdAt)],
      with: {
        artist: true,
        publisher: true,
      },
      limit: limit,
      offset: offset,
    });

    return { books: booksByCreator, totalPages, page };
  } catch (error) {
    console.error("Failed to get creator by slug", error);
    return null;
  }
};

export const getBooksByCreatorIdForOtherPublishers = async (
  user: AuthUser | null,
) => {
  if (!user) {
    return [];
  }

  try {
    // Subquery to check if publisher status is stub (to exclude)
    const stubPublisherSubquery = db
      .select()
      .from(creators)
      .where(
        and(eq(creators.id, books.publisherId), eq(creators.status, "stub")),
      );

    const booksByCreator = await db.query.books.findMany({
      where: and(
        eq(books.createdByUserId, user.id),
        ne(books.publisherId, user.creator?.id ?? ""),
        not(exists(stubPublisherSubquery)),
      ),
      orderBy: (books, { desc }) => [desc(books.releaseDate)],
      with: {
        artist: true,
        publisher: true,
      },
    });

    return booksByCreator;
  } catch (error) {
    console.error("Failed to get creator by slug", error);
  }
};

export const getBooksByCreatorIdForUnclaimedPublishers = async (
  user: AuthUser | null,
) => {
  if (!user) {
    return [];
  }

  try {
    // Subquery to check if publisher status is stub
    const stubPublisherSubquery = db
      .select()
      .from(creators)
      .where(
        and(eq(creators.id, books.publisherId), eq(creators.status, "stub")),
      );

    const booksByCreator = await db.query.books.findMany({
      where: and(
        eq(books.createdByUserId, user.id),
        exists(stubPublisherSubquery),
      ),
      orderBy: (books, { desc }) => [desc(books.releaseDate)],
      with: {
        artist: true,
        publisher: true,
      },
    });

    return booksByCreator;
  } catch (error) {
    console.error("Failed to get creator by slug", error);
  }
};

export const getBooksForApproval = async (publisherId: string) => {
  try {
    const booksForApproval = await db.query.books.findMany({
      where: and(
        eq(books.publisherId, publisherId),
        eq(books.approvalStatus, "pending"),
      ),
      orderBy: (books, { desc }) => [desc(books.releaseDate)],
      with: {
        artist: true,
        publisher: true,
      },
    });

    return booksForApproval;
  } catch (error) {
    console.error("Failed to get creator by slug", error);
  }
};

export const getBookBySlug = async (
  bookSlug: string,
  status: "published" | "draft" = "published",
) => {
  try {
    const book = await db.query.books.findFirst({
      where: and(eq(books.slug, bookSlug), eq(books.publicationStatus, status)),
      with: {
        publisher: true,
        images: {
          orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
        },
        artist: true,
      },
    });

    if (!book) return null;

    // Handle images - could be relation (bookImages[]) or field (string[])
    const galleryImages =
      book.images && Array.isArray(book.images) && book.images.length > 0
        ? typeof book.images[0] === "string"
          ? [] // If it's the string array field, we'll use bookImages relation instead
          : book.images.map((img: any) => ({ imageUrl: img.imageUrl }))
        : [];

    return {
      book: { ...book, images: galleryImages },
    };
  } catch (error) {
    console.error("Failed to get book by slug", error);
    return null;
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
    return book ?? null;
  } catch (error) {
    console.error("Failed to get book by id", error);
    return null;
  }
};

export const createBook = async (input: NewBook) => {
  try {
    const [newBook] = await db.insert(books).values(input).returning();
    return newBook;
  } catch (error) {
    console.error("Failed to create book", error);
    return null;
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

async function cleanupOrphanedStubCreator(creatorId: string) {
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
export const processTags = (tagsString?: string): string[] => {
  if (!tagsString) return [];
  return tagsString
    .split(",")
    .map((t: string) => t.trim().toLowerCase())
    .filter((t: string) => t.length > 0);
};

export const prepareBookData = async (
  formData: z.infer<typeof bookFormSchema>,
  bookCreator: Creator,
  userId: string,
  bookPublisher?: Creator | null,
): Promise<NewBook> => {
  const existingPublisherSelected = formData.publisher_id ? true : false;

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
    approvalStatus: existingPublisherSelected ? "pending" : "approved",
    publicationStatus: "draft",
    availabilityStatus: formData.availability_status,
  };
};

export const prepareBookUpdateData = (
  formData: z.infer<typeof bookFormSchema>,
): UpdateBook => {
  return {
    title: formData.title,
    description: formData.description || null,
    releaseDate: formData.release_date ? new Date(formData.release_date) : null,
    purchaseLink: formData.purchase_link ?? null,
    tags: processTags(formData.tags),
    availabilityStatus: formData.availability_status,
  };
};

export const getBookPermissionData = async (
  bookId: string,
): Promise<Pick<Book, "id" | "artistId" | "publisherId" | "title"> | null> => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: {
        id: true,
        artistId: true,
        publisherId: true,
        title: true,
      },
    });
    return book ?? null;
  } catch (error) {
    console.error("Failed to get book permission data", error);
    return null;
  }
};

export const searchBooks = async (searchQuery: string) => {
  try {
    const searchPattern = `%${searchQuery}%`;

    // Find creator IDs matching the search
    const matchingCreatorIds = db
      .select({ id: creators.id })
      .from(creators)
      .where(ilike(creators.displayName, searchPattern));

    return await db.query.books.findMany({
      with: {
        artist: true,
        publisher: true,
      },
      where: and(
        eq(books.publicationStatus, "published"),
        or(
          ilike(books.title, searchPattern),
          inArray(books.artistId, matchingCreatorIds),
          sql`EXISTS (
          SELECT 1 
          FROM unnest(${books.tags}) AS tag 
          WHERE LOWER(tag) LIKE ${searchPattern.toLowerCase()}
        )`,
        ),
      ),
      orderBy: (books, { asc }) => [asc(books.title)],
      limit: 5,
    });
  } catch (error) {
    console.error("Failed to search books", error);
    return [];
  }
};

export const getFeedBooks = async (
  userId: string,
  currentPage: number,
  defaultLimit = 12,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(follows)
      .where(eq(follows.followerUserId, userId));
    console.log("totalCount", totalCount);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );
    const userFollows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, userId),
        eq(follows.targetType, "creator"),
      ),
    });

    console.log("userFollows", userFollows);

    const followedCreatorIds = userFollows
      .map((follow) => follow.targetCreatorId)
      .filter((id): id is string => id !== null);

    console.log("followedCreatorIds", followedCreatorIds);

    // Find books where artistCreatorId or publisherId is in the followed creators list
    const feedBooks = await db.query.books.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        artistId: true,
        publisherId: true,
        releaseDate: true,
        coverUrl: true,
      },
      where: and(
        or(
          inArray(books.artistId, followedCreatorIds),
          inArray(books.publisherId, followedCreatorIds),
        ),
        eq(books.publicationStatus, "published"),
      ),
      with: {
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
      orderBy: (books, { desc }) => [desc(books.createdAt)],
      limit: limit,
      offset: offset,
    });
    return { books: feedBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get feed books", error);
    return null;
  }
};

export const getBooksInWishlist = async (
  userId: string,
  currentPage: number,
  defaultLimit = 12,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(wishlists)
      .where(eq(wishlists.userId, userId));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const wishlistItems = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, userId),
    });

    const wishlistedBooks = await db.query.books.findMany({
      where: inArray(
        books.id,
        wishlistItems.map((wishlist) => wishlist.bookId),
      ),
      with: {
        artist: true,
        publisher: true,
      },
      orderBy: (books, { desc }) => [desc(books.createdAt)],
      limit: limit,
      offset: offset,
    });
    return { books: wishlistedBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books in wishlist", error);
    return null;
  }
};

export const getBooksInCollection = async (userId: string) => {
  try {
    const collectionItems = await db.query.collectionItems.findMany({
      where: eq(wishlists.userId, userId),
    });

    return await db.query.books.findMany({
      where: inArray(
        books.id,
        collectionItems.map((collection) => collection.bookId),
      ),
      with: {
        artist: true,
        publisher: true,
      },
    });
  } catch (error) {
    console.error("Failed to get books in wishlist", error);
    return null;
  }
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

export const updateBookCoverImage = async (
  bookId: string,
  coverUrl: string,
) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ coverUrl })
      .where(eq(books.id, bookId))
      .returning();
    return updatedBook;
  } catch (error) {
    console.error("Failed to update book cover image", error);
    return null;
  }
};

export const approveBookById = async (bookId: string) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ approvalStatus: "approved" })
      .where(eq(books.id, bookId))
      .returning();
    return updatedBook;
  } catch (error) {
    console.error("Failed to approve book", error);
    return null;
  }
};

export const rejectBookById = async (bookId: string) => {
  try {
    const [updatedBook] = await db
      .update(books)
      .set({ approvalStatus: "rejected" })
      .where(eq(books.id, bookId))
      .returning();
    return updatedBook;
  } catch (error) {
    console.error("Failed to reject book", error);
    return null;
  }
};
