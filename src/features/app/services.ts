import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../../db/client";
import {
  bookComments,
  books,
  collectionItems,
  creators,
  follows,
  wishlists,
} from "../../db/schema";
import { getPagination } from "../../lib/pagination";
import { getBooksOrderBy } from "../../lib/booksOrderBy";
import {
  BOOK_CARD_COLUMNS,
  BookCardResult,
  CREATOR_CARD_COLUMNS,
  CreatorCardResult,
} from "../../constants/queries";
import { creatorMessages } from "../../db/schema";
import { err, ok } from "../../lib/result";

export const getDisplayName = (
  commentUser: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null,
) => {
  if (!commentUser) return "Unknown user";

  const fullName = [commentUser.firstName, commentUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || commentUser.email;
};

export const getVerifiedCreators = async () => {
  try {
    const foundCreators = await db.query.creators.findMany({
      where: eq(creators.status, "verified"),
      columns: CREATOR_CARD_COLUMNS,
      with: {
        booksAsArtist: {
          columns: { id: true },
          where: eq(books.publicationStatus, "published"),
        },
        booksAsPublisher: {
          columns: { id: true },
          where: eq(books.publicationStatus, "published"),
        },
      },
    });
    const verifiedCreatorsWithPublishedBooks = foundCreators
      .filter(
        (creator) =>
          creator.booksAsArtist.length > 0 ||
          creator.booksAsPublisher.length > 0,
      )
      .map(({ booksAsArtist, booksAsPublisher, ...creator }) => creator);

    return ok(verifiedCreatorsWithPublishedBooks);
  } catch (error) {
    console.error("Failed to get verified creators", error);
    return err({ reason: "Failed to get verified creators", error });
  }
};

export const getBookComments = async (bookId: string) => {
  try {
    const comments = await db.query.bookComments.findMany({
      where: eq(bookComments.bookId, bookId),
      orderBy: (bookComments, { desc }) => [desc(bookComments.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true,
          },
          with: {
            creators: {
              columns: CREATOR_CARD_COLUMNS,
            },
          },
        },
      },
    });
    if (!comments) return err({ reason: "No comments found" });
    return ok(comments);
  } catch (error) {
    console.error("Failed to get book comments", error);
    return err({ reason: "Failed to get book comments", error });
  }
};

export const getCommentById = async (commentId: string) => {
  try {
    const comment = await db.query.bookComments.findFirst({
      where: eq(bookComments.id, commentId),
    });
    return ok(comment);
  } catch (error) {
    console.error("Failed to get comment by id", error);
    return err({ reason: "Failed to get comment by id", error });
  }
};

export const updateCommentById = async (commentId: string, body: string) => {
  try {
    const updatedComment = await db
      .update(bookComments)
      .set({ body })
      .where(eq(bookComments.id, commentId))
      .returning();
    if (!updatedComment) return err({ reason: "Comment not found" });
    return ok(updatedComment[0] ?? null);
  } catch (error) {
    console.error("Failed to update comment", error);
    return err({ reason: "Failed to update comment", error });
  }
};

export const deleteCommentById = async (commentId: string) => {
  try {
    await db.delete(bookComments).where(eq(bookComments.id, commentId));
    return ok(undefined);
  } catch (error) {
    console.error("Failed to delete comment", error);
    return err({ reason: "Failed to delete comment", error });
  }
};

export const getBooksInWishlist = async (
  userId: string,
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
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
      columns: BOOK_CARD_COLUMNS,
      where: inArray(
        books.id,
        wishlistItems.map((wishlist) => wishlist.bookId),
      ),
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS,
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS,
        },
      },
      orderBy: getBooksOrderBy(sortBy),
      limit: limit,
      offset: offset,
    });
    return { books: wishlistedBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books in wishlist", error);
    return null;
  }
};

export const getBooksInCollection = async (
  userId: string,
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
  defaultLimit = 12,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(collectionItems)
      .where(eq(collectionItems.userId, userId));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundCollectionItems = await db.query.collectionItems.findMany({
      where: eq(collectionItems.userId, userId),
    });

    const collectionBooks = await db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where: inArray(
        books.id,
        foundCollectionItems.map((collectionItem) => collectionItem.bookId),
      ),
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS,
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS,
        },
      },
      orderBy: getBooksOrderBy(sortBy),
      limit: limit,
      offset: offset,
    });

    return { books: collectionBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books in collection", error);
    return null;
  }
};

export const getBooksByCreatorSlug = async (
  slug: string,
  currentPage: number = 1,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
  defaultLimit = 16,
) => {
  try {
    // 1. Fetch creator without books
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug),
    });

    if (!creator) {
      return err({ reason: "Creator not found" });
    }

    // 2. Count books for this creator (by type)
    const bookColumn =
      creator.type === "publisher" ? books.publisherId : books.artistId;

    const limit = defaultLimit;
    const offset = (currentPage - 1) * defaultLimit;

    const [countResult, foundBooks] = await Promise.all([
      db
        .select({ value: count() })
        .from(books)
        .where(
          and(
            eq(bookColumn, creator.id),
            eq(books.publicationStatus, "published"),
            eq(books.approvalStatus, "approved"),
          ),
        ),
      db.query.books.findMany({
        columns: BOOK_CARD_COLUMNS,
        where: and(
          eq(bookColumn, creator.id),
          eq(books.publicationStatus, "published"),
          or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
        ),
        orderBy: getBooksOrderBy(sortBy),
        limit,
        offset,
        with: {
          artist: {
            columns: CREATOR_CARD_COLUMNS,
          },
          publisher: {
            columns: CREATOR_CARD_COLUMNS,
          },
        },
      }),
    ]);

    const totalCount = countResult[0]?.value ?? 0;
    const { totalPages: totalPagesComputed, page: pageComputed } =
      getPagination(currentPage, totalCount, defaultLimit);

    const relatedCreators = await getRelatedCreators(creator.id, creator.type);

    return ok({
      creator,
      books: foundBooks,
      totalPages: totalPagesComputed,
      page: pageComputed,
      relatedCreators,
    });
  } catch (error) {
    console.warn(error);
    return err({ reason: "Failed to get books by creator slug", error });
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
        artist: true,
        images: {
          orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
        },
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

export const getFirstBookByTag = async (tag: string) => {
  try {
    const [error, result] = await getBooksByTag(tag, 1, "newest", 1);
    if (error) return err({ reason: "Failed to get first book by tag", error });
    const { books } = result;
    return ok(books[0]); // could be undefined if no match
  } catch (error) {
    console.error("Failed to get first book by tag", error);
    return err({ reason: "Failed to get first book by tag" });
  }
};

export const getBooksByTag = async (
  tag: string,
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
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
          or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
        ),
      columns: BOOK_CARD_COLUMNS,
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS,
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS,
        },
      },
      orderBy: getBooksOrderBy(sortBy),
      limit: limit,
      offset: offset,
    });
    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books by tag", error);
    return err({ reason: "Failed to get books by tag", error });
  }
};

export const getLatestBooks = async (
  currentPage: number,
  defaultLimit = 15,
) => {
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
      columns: BOOK_CARD_COLUMNS,
      where: and(
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
      ),
      limit: limit,
      offset: offset,
      orderBy: [desc(books.createdAt)],
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS,
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS,
        },
      },
    });
    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books", error);
    return err({ reason: "Failed to get books" });
  }
};

export const getFeedBooks = async (
  userId: string,
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
  defaultLimit = 12,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(follows)
      .where(eq(follows.followerUserId, userId));

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

    const followedCreatorIds = userFollows
      .map((follow) => follow.targetCreatorId)
      .filter((id): id is string => id !== null);

    // Find books where artistCreatorId or publisherId is in the followed creators list
    const feedBooks = await db.query.books.findMany({
      where: and(
        or(
          inArray(books.artistId, followedCreatorIds),
          inArray(books.publisherId, followedCreatorIds),
        ),
        eq(books.publicationStatus, "published"),
        or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
      ),
      columns: BOOK_CARD_COLUMNS,
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS,
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS,
        },
      },
      orderBy: getBooksOrderBy(sortBy),
      limit: limit,
      offset: offset,
    });
    return { books: feedBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get feed books", error);
    return null;
  }
};

export const getAllCreatorsByType = async (
  type: "artist" | "publisher",
  currentPage: number = 1,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(creators)
      .where(eq(creators.type, type));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
    );

    const foundCreators = await db.query.creators.findMany({
      where: eq(creators.type, type),
      orderBy: (creators, { asc }) => [asc(creators.displayName)],
      offset,
      with: {
        booksAsArtist: {
          where: eq(books.publicationStatus, "published"),
        },
        booksAsPublisher: {
          where: eq(books.publicationStatus, "published"),
        },
      },
    });

    const creatorsWithBooks = foundCreators
      .filter(
        (creator) =>
          creator.booksAsArtist.length + creator.booksAsPublisher.length >= 1,
      )
      .map((creator) => ({
        ...creator,
        books: creator.booksAsArtist.length + creator.booksAsPublisher.length,
      }));

    return { creators: creatorsWithBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get all creators by type", error);
    return { creators: [], totalPages: 0, page: 1 };
  }
};

export const searchCreators = async (searchQuery: string) => {
  // find creators with at least one book
  try {
    const foundCreators = await db.query.creators.findMany({
      columns: {
        id: true,
        displayName: true,
        slug: true,
        coverUrl: true,
        status: true,
        type: true,
      },
      where: and(
        ilike(creators.displayName, `%${searchQuery}%`),
        // exists(db.select().from(books).where(eq(books.artistId, creators.id))),
      ),
      with: {
        booksAsArtist: {
          where: eq(books.publicationStatus, "published"),
        },
        booksAsPublisher: {
          where: eq(books.publicationStatus, "published"),
        },
      },
      orderBy: (creators, { asc }) => [asc(creators.displayName)],
      limit: 5,
    });

    return foundCreators.filter(
      (creator) =>
        creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0,
    );
  } catch (error) {
    console.error("Failed to search creators", error);
    return [];
  }
};

export const getRelatedBooks = async (
  currentBookId: string,
  options: {
    artistId: string | null;
    publisherId: string | null;
    tags: string[] | null;
  },
  limit = 10,
): Promise<BookCardResult[]> => {
  try {
    const seenIds = new Set<string>([currentBookId]);
    const result: BookCardResult[] = [];

    const baseConditions = and(
      ne(books.id, currentBookId),
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
      or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
    );

    // 1. Same artist first
    if (options.artistId) {
      const byArtist = await db.query.books.findMany({
        columns: BOOK_CARD_COLUMNS,
        where: and(baseConditions, eq(books.artistId, options.artistId)),
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS },
        },
        orderBy: (books, { desc }) => [desc(books.releaseDate)],
        limit,
      });
      for (const b of byArtist) {
        result.push(b);
        seenIds.add(b.id);
      }
    }

    if (result.length >= limit) return result.slice(0, limit);

    // 2. By tag overlap — only when book has tags; exclude already-seen in JS
    const tagsNormalized =
      options.tags?.map((x) => x.trim().toLowerCase()).filter(Boolean) ?? [];
    if (tagsNormalized.length > 0) {
      const tagCondition = sql`EXISTS (
        SELECT 1 FROM unnest(${books.tags}) AS t
        WHERE LOWER(TRIM(t)) IN (${sql.join(
          tagsNormalized.map((tag) => sql`${tag}`),
          sql`, `,
        )})
      )`;
      const byTag = await db.query.books.findMany({
        columns: BOOK_CARD_COLUMNS,
        where: and(baseConditions, tagCondition),
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS },
        },
        orderBy: (books, { desc }) => [desc(books.releaseDate)],
        limit: limit + seenIds.size,
      });
      for (const b of byTag) {
        if (result.length >= limit) break;
        if (!seenIds.has(b.id)) {
          result.push(b);
          seenIds.add(b.id);
        }
      }
    }

    if (result.length >= limit) return result.slice(0, limit);

    // 3. Same publisher — exclude already-seen in JS (no NOT IN array in SQL)
    if (options.publisherId) {
      const byPublisher = await db.query.books.findMany({
        columns: BOOK_CARD_COLUMNS,
        where: and(baseConditions, eq(books.publisherId, options.publisherId)),
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS },
        },
        orderBy: (books, { desc }) => [desc(books.releaseDate)],
        limit: limit + seenIds.size,
      });
      for (const b of byPublisher) {
        if (result.length >= limit) break;
        if (!seenIds.has(b.id)) {
          result.push(b);
        }
      }
    }

    return result.slice(0, limit);
  } catch (error) {
    console.error("Failed to get related books", error);
    return [];
  }
};

export const getRelatedCreators = async (
  creatorId: string,
  creatorType: "artist" | "publisher",
): Promise<CreatorCardResult[]> => {
  try {
    const relatedColumn =
      creatorType === "publisher" ? books.artistId : books.publisherId;
    const myColumn =
      creatorType === "publisher" ? books.publisherId : books.artistId;

    const publishedBooks = await db
      .selectDistinct({ relatedId: relatedColumn })
      .from(books)
      .where(
        and(
          eq(myColumn, creatorId),
          eq(books.publicationStatus, "published"),
          eq(books.approvalStatus, "approved"),
          or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
        ),
      );

    const relatedIds = publishedBooks
      .map((r) => r.relatedId)
      .filter((id): id is string => id != null);

    if (relatedIds.length === 0) return [];

    const related = await db.query.creators.findMany({
      columns: CREATOR_CARD_COLUMNS,
      where: inArray(creators.id, relatedIds),
      orderBy: (c, { asc }) => [asc(c.displayName)],
    });

    return related;
  } catch (error) {
    console.error("Failed to get related creators", error);
    return [];
  }
};

// Add this function (and keep the getPagination + follows pattern consistent with getFeedBooks):
export const getMessagesForFollower = async (
  followerUserId: string,
  currentPage = 1,
  limit = 20,
) => {
  try {
    const userFollows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, followerUserId),
        eq(follows.targetType, "creator"),
      ),
    });
    const followedCreatorIds = userFollows
      .map((f) => f.targetCreatorId)
      .filter((id): id is string => id != null);
    if (followedCreatorIds.length === 0) {
      return { messages: [], totalPages: 0, page: 1 };
    }

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(creatorMessages)
      .where(inArray(creatorMessages.creatorId, followedCreatorIds));

    const {
      page,
      limit: take,
      offset,
      totalPages,
    } = getPagination(currentPage, totalCount, limit);

    const messages = await db.query.creatorMessages.findMany({
      where: inArray(creatorMessages.creatorId, followedCreatorIds),
      orderBy: [desc(creatorMessages.createdAt)],
      limit: take,
      offset,
      with: {
        creator: {
          columns: { id: true, displayName: true, slug: true, coverUrl: true },
        },
      },
    });
    return { messages, totalPages, page };
  } catch (e) {
    console.error("Failed to get messages for follower", e);
    return { messages: [], totalPages: 0, page: 1 };
  }
};

export const getHomepageStats = async () => {
  const now = new Date();
  const [booksCountResult, artistsCountResult, publishersCountResult] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(books)
        .where(
          and(
            eq(books.publicationStatus, "published"),
            eq(books.approvalStatus, "approved"),
            or(isNull(books.releaseDate), lte(books.releaseDate, now)),
          ),
        ),
      db
        .select({ value: count() })
        .from(creators)
        .where(eq(creators.type, "artist")),
      db
        .select({ value: count() })
        .from(creators)
        .where(eq(creators.type, "publisher")),
    ]);
  return {
    books: booksCountResult[0]?.value ?? 0,
    artists: artistsCountResult[0]?.value ?? 0,
    publishers: publishersCountResult[0]?.value ?? 0,
  };
};

export const getFollowedCreators = async (followerUserId: string) => {
  try {
    const followRows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, followerUserId),
        eq(follows.targetType, "creator"),
      ),
      columns: { targetCreatorId: true },
    });
    const followedCreatorIds = followRows
      .map((r) => r.targetCreatorId)
      .filter((id): id is string => id != null);

    const foundCreators = await db.query.creators.findMany({
      where: inArray(creators.id, followedCreatorIds),
      columns: CREATOR_CARD_COLUMNS,
    });

    const artists = foundCreators.filter((c) => c.type === "artist");
    const publishers = foundCreators.filter((c) => c.type === "publisher");

    return ok({ artists, publishers });
  } catch (error) {
    console.error("Failed to get followed creators", error);
    return err({ reason: "Failed to get followed creators", error });
  }
};

/** Recent published book covers for a publisher (creator id), newest first. */
export async function getCoverUrlsForHeroCarousel(
  creatorType: "publisher" | "artist",
  creatorId: string,
  limit = 4,
) {
  const column =
    creatorType === "publisher" ? books.publisherId : books.artistId;
  try {
    const rows = await db.query.books.findMany({
      columns: { coverUrl: true },
      where: and(
        eq(column, creatorId),
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        isNotNull(books.coverUrl),
        or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
      ),
      orderBy: (b, { desc: d }) => [d(b.releaseDate), d(b.createdAt)],
      limit,
    });
    const coverUrls = rows
      .map((r) => r.coverUrl)
      .filter((url): url is string => Boolean(url));
    return ok(coverUrls);
  } catch (e) {
    console.error("getCoverUrlsForPublisherCatalogue", e);
    return err({
      reason: "Failed to get cover urls for publisher catalogue",
      error: e,
    });
  }
}
