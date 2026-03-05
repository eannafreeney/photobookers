import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { books, creators, follows, wishlists } from "../../db/schema";
import { getPagination } from "../../lib/pagination";
import { getBooksOrderBy } from "../../lib/booksOrderBy";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
} from "../../constants/queries";

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

export const getBooksByCreatorSlug = async (
  slug: string,
  currentPage: number = 1,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
  defaultLimit = 12,
) => {
  try {
    // 1. Fetch creator without books
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug),
    });

    if (!creator) {
      return {
        creator: null,
        books: [],
        artists: [],
        totalPages: 0,
        page: 1,
        limit: defaultLimit,
      };
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

    return {
      creator,
      books: foundBooks,
      totalPages: totalPagesComputed,
      page: pageComputed,
    };
  } catch (error) {
    console.warn(error);
    return { creator: null, books: [], totalPages: 0, page: 1 };
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

export const getBooksByTag = async (
  tag: string,
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc",
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
    return { books: foundBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books by tag", error);
    return { books: [], totalPages: 0, page: 1 };
  }
};

export const getLatestBooks = async (
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
  defaultLimit = 10,
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
        // lte(books.releaseDate, new Date()),
      ),
      limit: limit,
      offset: offset,
      orderBy: getBooksOrderBy(sortBy),
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS,
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS,
        },
      },
    });
    return { books: foundBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books", error);
    return { books: [], totalPages: 0, page: 1 };
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
  defaultLimit = 50,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(creators)
      .where(eq(creators.type, type));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );
    const foundCreators = await db.query.creators.findMany({
      where: eq(creators.type, type),
      orderBy: (creators, { asc }) => [asc(creators.displayName)],
      limit,
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
