import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  ne,
  or,
  sql
} from "drizzle-orm";
import { db } from "../../../db/client.js";
import {
  bookImages,
  books,
  creators
} from "../../../db/schema.js";
import { generateUniqueBookSlug } from "../../../utils.js";
import { processTags } from "./utils.js";
import { getPagination } from "../../../lib/pagination.js";
import { err, ok } from "../../../lib/result.js";
import { invalidateBookCache, invalidateCreatorCache } from "../../app/services.js";
import { shouldModerateNewBook } from "../../../lib/bookModeration.js";
async function assignNextBookSortOrder() {
  const [{ maxOrder }] = await db.select({ maxOrder: sql`COALESCE(MAX(${books.sortOrder}), 0)` }).from(books);
  return Number(maxOrder ?? 0) + 1;
}
async function countBooksUploadedSinceCreatorVerification(userId, verifiedAt) {
  const [{ value }] = await db.select({ value: count() }).from(books).where(
    and(eq(books.createdByUserId, userId), gte(books.createdAt, verifiedAt))
  );
  return Number(value ?? 0);
}
async function getNewBookModerationForUser(user) {
  const verifiedAt = user.creator?.verifiedAt ?? null;
  const creatorStatus = user.creator?.status ?? "stub";
  const uploadedSince = verifiedAt && creatorStatus === "verified" ? await countBooksUploadedSinceCreatorVerification(user.id, verifiedAt) : 0;
  const approvedBooksSinceVerificationBeforeInsert = verifiedAt && creatorStatus === "verified" ? await countApprovedBooksSinceCreatorVerification(user.id, verifiedAt) : 0;
  return {
    isAdminContext: false,
    creatorVerifiedAt: verifiedAt,
    creatorStatus,
    booksUploadedSinceVerificationBeforeInsert: uploadedSince,
    approvedBooksSinceVerificationBeforeInsert
  };
}
const createBook = async (input) => {
  try {
    const [newBook] = await db.insert(books).values(input).returning();
    return newBook;
  } catch (error) {
    console.error("Failed to create book", error);
    return null;
  }
};
const getArtistByBookId = async (bookId) => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: { artist: true }
    });
    if (!book) return err({ reason: "Book not found" });
    if (!book.artist) return err({ reason: "Artist not found" });
    return ok({ artist: book.artist, artistId: book.artist.id });
  } catch (error) {
    console.error("Failed to get artist by book id", error);
    return err({ reason: "Failed to get artist by book id" });
  }
};
const getBooksPerArtistId = async (artistId, bookId, currentPage = 1, defaultLimit = 5) => {
  try {
    const artist = await db.query.creators.findFirst({
      columns: { id: true, displayName: true, slug: true, coverUrl: true },
      where: eq(creators.id, artistId)
    });
    if (!artist) return err({ reason: "Artist not found" });
    const whereClause = and(
      ne(books.id, bookId),
      eq(books.artistId, artistId),
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
      or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
    );
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(whereClause);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundBooks = await db.query.books.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        releaseDate: true
      },
      where: whereClause,
      orderBy: [asc(books.sortOrder), desc(books.createdAt)],
      with: {
        artist: {
          columns: { id: true, displayName: true, slug: true, coverUrl: true }
        },
        publisher: { columns: { id: true, displayName: true } }
      },
      limit,
      offset
    });
    return ok({ books: foundBooks, totalPages, page, artist });
  } catch (error) {
    console.error("Failed to get books for artist", error);
    return err({ reason: "Failed to get books for artist" });
  }
};
const getPublisherByBookId = async (bookId) => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: { publisher: true }
    });
    if (!book) return err({ reason: "Book not found" });
    if (!book.publisher) return err({ reason: "Publisher not found" });
    return ok({ publisher: book.publisher, publisherId: book.publisher.id });
  } catch (error) {
    console.error("Failed to get artist by book id", error);
    return err({ reason: "Failed to get artist by book id" });
  }
};
const getBooksByArtistId = async (artistId, currentPage, searchTerm, defaultLimit = 30) => {
  const baseFilter = eq(books.artistId, artistId);
  const titleFilter = searchTerm?.trim() ? ilike(books.title, `%${searchTerm.trim()}%`) : void 0;
  const whereClause = titleFilter ? and(baseFilter, titleFilter) : baseFilter;
  try {
    const countResult = await db.select({ value: count() }).from(books).leftJoin(creators, eq(books.publisherId, creators.id)).where(whereClause);
    const totalCount = Number(countResult[0]?.value ?? 0);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const artistBookIdsSubquery = db.select({ id: books.id }).from(books).leftJoin(creators, eq(books.publisherId, creators.id)).where(whereClause);
    const booksByArtist = await db.query.books.findMany({
      where: inArray(books.id, artistBookIdsSubquery),
      orderBy: [asc(books.sortOrder), desc(books.createdAt)],
      with: { artist: true, publisher: true },
      limit,
      offset
    });
    return ok({ books: booksByArtist, totalPages, page });
  } catch (error) {
    console.error("Failed to get books by artist", error);
    return err({ reason: "Failed to get books by artist" });
  }
};
const getBooksPerPublisherId = async (publisherId, bookId, currentPage = 1, defaultLimit = 5) => {
  try {
    const publisher = await db.query.creators.findFirst({
      columns: { id: true, displayName: true, slug: true, coverUrl: true },
      where: eq(creators.id, publisherId)
    });
    if (!publisher) return err({ reason: "Publisher not found" });
    const whereClause = and(
      ne(books.id, bookId),
      eq(books.publisherId, publisherId),
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
      or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
    );
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(whereClause);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundBooks = await db.query.books.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        releaseDate: true
      },
      where: whereClause,
      orderBy: [asc(books.sortOrder), desc(books.createdAt)],
      with: {
        artist: {
          columns: { id: true, displayName: true, slug: true, coverUrl: true }
        },
        publisher: { columns: { id: true, displayName: true } }
      },
      limit,
      offset
    });
    return ok({ books: foundBooks, totalPages, page, publisher });
  } catch (error) {
    console.error("Failed to get books for artist", error);
    return err({ reason: "Failed to get books for artist" });
  }
};
const getBooksByPublisherId = async (publisherId, currentPage, searchTerm, defaultLimit = 30) => {
  const baseFilter = eq(books.publisherId, publisherId);
  const titleFilter = searchTerm?.trim() ? ilike(books.title, `%${searchTerm.trim()}%`) : void 0;
  const whereClause = titleFilter ? and(baseFilter, titleFilter) : baseFilter;
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(whereClause);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const booksByPublisher = await db.query.books.findMany({
      where: whereClause,
      orderBy: [asc(books.sortOrder), desc(books.createdAt)],
      with: {
        artist: true,
        publisher: true
      },
      limit,
      offset
    });
    return ok({ books: booksByPublisher, totalPages, page });
  } catch (error) {
    console.error("Failed to get books by creator", error);
    return err({ reason: "Failed to get books by creator" });
  }
};
function creatorBookFilter(creatorId, creatorType) {
  return creatorType === "publisher" ? eq(books.publisherId, creatorId) : eq(books.artistId, creatorId);
}
const reorderBooksForCreator = async (creator, orderedIds) => {
  if (!orderedIds.length) {
    return err({ reason: "No books to reorder" });
  }
  if (new Set(orderedIds).size !== orderedIds.length) {
    return err({ reason: "Duplicate book IDs" });
  }
  const bookColumn = creatorBookFilter(creator.id, creator.type);
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(bookColumn);
    if (orderedIds.length !== Number(totalCount)) {
      return err({ reason: "Must include all books" });
    }
    const ownedBooks = await db.query.books.findMany({
      columns: { id: true },
      where: and(bookColumn, inArray(books.id, orderedIds))
    });
    if (ownedBooks.length !== orderedIds.length) {
      return err({
        reason: "One or more books do not belong to this creator"
      });
    }
    await db.transaction(async (tx) => {
      for (const [index, bookId] of orderedIds.entries()) {
        await tx.update(books).set({ sortOrder: index }).where(and(eq(books.id, bookId), bookColumn));
      }
    });
    if (creator.slug) {
      invalidateCreatorCache(creator.slug);
    }
    return ok(void 0);
  } catch (error) {
    console.error("Failed to reorder books for creator", error);
    return err({ reason: "Failed to reorder books", cause: error });
  }
};
const getBookById = async (bookId) => {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: {
        publisher: true,
        artist: true,
        bookOfTheDay: true,
        images: {
          orderBy: (bookImages2, { asc: asc2 }) => [asc2(bookImages2.sortOrder)]
        }
      }
    });
    if (!book) return err({ reason: "Book not found" });
    return ok(book);
  } catch (error) {
    console.error("Failed to get book by id", error);
    return err({ reason: "Failed to get book by id" });
  }
};
const getBookByIdBasic = async (bookId) => {
  try {
    const book = await db.query.books.findFirst({
      columns: {
        id: true,
        title: true,
        slug: true
      },
      where: eq(books.id, bookId)
    });
    if (!book) return err({ reason: "Book not found" });
    return ok(book);
  } catch (error) {
    console.error("Failed to get book by id", error);
    return err({ reason: "Failed to get book by id" });
  }
};
const updateBook = async (input, bookId) => {
  try {
    const [updatedBook] = await db.update(books).set(input).where(eq(books.id, bookId)).returning();
    if (updatedBook?.slug) {
      invalidateBookCache(updatedBook.slug);
    }
    return ok(updatedBook);
  } catch (error) {
    console.error("Failed to update book", error);
    return err({ reason: "Failed to update book", cause: error });
  }
};
const deleteBookById = async (bookId) => {
  try {
    const [book] = await db.select().from(books).where(eq(books.id, bookId));
    if (!book) return null;
    await db.delete(bookImages).where(eq(bookImages.bookId, bookId));
    const [deletedBook] = await db.delete(books).where(eq(books.id, bookId)).returning();
    if (book.publisherId) {
      await cleanupOrphanedStubCreator(book.publisherId);
    }
    if (book.artistId) {
      await cleanupOrphanedStubCreator(book.artistId);
    }
    return deletedBook;
  } catch (error) {
    console.error("Failed to delete book", error);
    return null;
  }
};
async function cleanupOrphanedStubCreator(creatorId) {
  const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));
  if (creator?.status !== "stub") return;
  const otherBooks = await db.select({ id: books.id }).from(books).where(or(eq(books.artistId, creatorId), eq(books.publisherId, creatorId))).limit(1);
  if (otherBooks.length === 0) {
    await db.delete(creators).where(eq(creators.id, creatorId));
  }
}
const buildCreateBookData = async (formData, bookCreator, userId, bookPublisher, moderation) => {
  const shouldNotify = !!formData.send_email_to_followers_on_release && !!formData.release_date;
  let approvalStatus = "pending";
  let sortOrder;
  if (moderation.isAdminContext) {
    approvalStatus = "approved";
    sortOrder = await assignNextBookSortOrder();
  } else if (!shouldModerateNewBook({
    creatorVerifiedAt: moderation.creatorVerifiedAt,
    creatorStatus: moderation.creatorStatus,
    booksUploadedSinceVerificationBeforeInsert: moderation.booksUploadedSinceVerificationBeforeInsert,
    approvedBooksSinceVerificationBeforeInsert: moderation.approvedBooksSinceVerificationBeforeInsert
  })) {
    approvalStatus = "approved";
    sortOrder = await assignNextBookSortOrder();
  }
  return {
    title: formData.title,
    description: formData.description || null,
    releaseDate: formData.release_date ? new Date(formData.release_date) : null,
    slug: await generateUniqueBookSlug(
      formData.title,
      bookCreator?.displayName
    ),
    artistId: bookCreator?.id ?? null,
    publisherId: bookPublisher?.id ?? null,
    createdByUserId: userId,
    tags: processTags(formData.tags),
    purchaseLink: formData.purchase_link ?? null,
    approvalStatus,
    publicationStatus: "draft",
    availabilityStatus: formData.availability_status,
    notifyFollowersOnRelease: shouldNotify,
    notifyFollowersScheduledDate: shouldNotify ? new Date(formData.release_date ?? "") : null,
    notifyFollowersSentAt: null,
    notifyFollowersCreatorId: bookCreator?.id ?? null,
    ...sortOrder !== void 0 ? { sortOrder } : {}
  };
};
async function countApprovedBooksSinceCreatorVerification(userId, verifiedAt) {
  const [{ value }] = await db.select({ value: count() }).from(books).where(
    and(
      eq(books.createdByUserId, userId),
      gte(books.createdAt, verifiedAt),
      eq(books.approvalStatus, "approved")
    )
  );
  return Number(value ?? 0);
}
const buildUpdateBookData = (formData, artistId, publisherId) => {
  return {
    title: formData.title,
    description: formData.description || null,
    releaseDate: formData.release_date ? new Date(formData.release_date) : null,
    purchaseLink: formData.purchase_link ?? null,
    tags: processTags(formData.tags),
    availabilityStatus: formData.availability_status,
    artistId,
    publisherId
  };
};
const updateBookPublicationStatus = async (bookId, publicationStatus) => {
  try {
    const [updatedBook] = await db.update(books).set({ publicationStatus }).where(eq(books.id, bookId)).returning();
    if (updatedBook?.slug) {
      invalidateBookCache(updatedBook.slug);
    }
    if (!updatedBook) return err({ reason: "Book not found after update" });
    return ok(updatedBook);
  } catch (error) {
    console.error("Failed to update book publication status", error);
    if (error.cause?.constraint_name === "cover_required_for_publish") {
      return err({ reason: "Add a cover image before publishing" });
    }
    return err({ reason: "Failed to update book mode" });
  }
};
const getBooksForStubPublishersByCreatorId = async (creatorId) => {
  if (!creatorId) return [];
  const stubPublishersWithBooks = await db.query.creators.findMany({
    where: and(eq(creators.status, "stub"), ne(creators.id, creatorId)),
    with: {
      booksAsPublisher: {
        where: eq(books.artistId, creatorId)
      }
    }
  });
  return stubPublishersWithBooks.flatMap((c) => c.booksAsPublisher);
};
const resubmitBook = async (bookId) => {
  try {
    const [updatedBook] = await db.update(books).set({ approvalStatus: "pending" }).where(eq(books.id, bookId)).returning();
    if (!updatedBook) return err({ reason: "Book not found" });
    return ok(updatedBook);
  } catch (error) {
    console.error("Failed to resubmit book", error);
    return err({ reason: "Failed to resubmit book", cause: error });
  }
};
const getBooksForBulkBookImagesUpload = async (bookIds, user) => {
  if (!user.creator) {
    return err({ reason: "Creator not found" });
  }
  try {
    const creatorBooks = await db.select({
      id: books.id,
      title: books.title,
      slug: books.slug,
      coverUrl: books.coverUrl
    }).from(books).where(
      and(
        inArray(books.id, bookIds),
        user.creator.type === "artist" ? eq(books.artistId, user.creator.id) : eq(books.publisherId, user.creator.id)
      )
    );
    return ok(creatorBooks);
  } catch (error) {
    console.error("Failed to get books for bulk cover upload", error);
    return err({
      reason: "Failed to get books for bulk cover upload",
      cause: error
    });
  }
};
export {
  assignNextBookSortOrder,
  buildCreateBookData,
  buildUpdateBookData,
  cleanupOrphanedStubCreator,
  countApprovedBooksSinceCreatorVerification,
  countBooksUploadedSinceCreatorVerification,
  createBook,
  deleteBookById,
  getArtistByBookId,
  getBookById,
  getBookByIdBasic,
  getBooksByArtistId,
  getBooksByPublisherId,
  getBooksForBulkBookImagesUpload,
  getBooksForStubPublishersByCreatorId,
  getBooksPerArtistId,
  getBooksPerPublisherId,
  getNewBookModerationForUser,
  getPublisherByBookId,
  reorderBooksForCreator,
  resubmitBook,
  updateBook,
  updateBookPublicationStatus
};
