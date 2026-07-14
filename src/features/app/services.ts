import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  InferSelectModel,
  isNotNull,
  isNull,
  lte,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "../../db/client";
import {
  bookComments,
  books,
  bookViews,
  collectionItems,
  creatorInterviews,
  creators,
  follows,
  users,
  wishlists,
} from "../../db/schema";
import { supabaseAdmin } from "../../lib/supabase";
import { getPagination } from "../../lib/pagination";
import {
  type BookCatalogSort,
  getBookCatalogOrderBy,
} from "../../lib/bookCatalogSort";
import { getPublicBooksForCreator } from "../../domain/creators/books";
import { getBooksOrderBy } from "../../lib/booksOrderBy";
import { slugToTag, tagMatchesBookTags } from "../../lib/tags";
import { FEATURED_BOOK_GROUPS } from "../../constants/featuredBookGroups";
import {
  BOOK_CARD_COLUMNS,
  BookCardResult,
  CREATOR_CARD_COLUMNS,
  CREATOR_CARD_SELECT,
} from "../../constants/queries";
import { Creator, creatorMessages } from "../../db/schema";
import { err, ok } from "../../lib/result";
import { isFeatureEnabled } from "../../lib/features";
import { mergeFeedItems } from "./followerFeed";
import { LRUCache } from "lru-cache";

type CachedBook = Omit<InferSelectModel<typeof books>, "images"> & {
  publisher: Creator | null;
  artist: Creator | null;
  images: { imageUrl: string }[];
};

const bookCache = new LRUCache<
  string,
  ReturnType<typeof ok<{ book: CachedBook }>>
>({
  max: 200,
  ttl: 1000 * 60 * 5,
});

const creatorCache = new LRUCache<string, any>({
  max: 200,
  ttl: 1000 * 60 * 5,
});

export const invalidateBookCache = (slug: string) => {
  bookCache.delete(`${slug}:published`);
  bookCache.delete(`${slug}:draft`);
};

export const invalidateCreatorCache = (slug: string) => {
  // Deletes all paginated entries for this creator
  for (const key of creatorCache.keys()) {
    if (key.startsWith(`${slug}:`)) {
      creatorCache.delete(key);
    }
  }
};

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

export const getRecentlyVerifiedCreators = async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const foundCreators = await db.query.creators.findMany({
      where: and(
        eq(creators.status, "verified"),
        isNotNull(creators.verifiedAt),
        gte(creators.verifiedAt, cutoff),
      ),
      columns: {
        id: true,
        slug: true,
        displayName: true,
        type: true,
      },
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
      orderBy: [asc(creators.verifiedAt)],
    });

    const recentlyVerifiedWithPublishedBooks = foundCreators
      .filter(
        (creator) =>
          creator.booksAsArtist.length > 0 ||
          creator.booksAsPublisher.length > 0,
      )
      .map(({ booksAsArtist, booksAsPublisher, ...creator }) => creator);

    return ok(recentlyVerifiedWithPublishedBooks);
  } catch (error) {
    console.error("Failed to get recently verified creators", error);
    return err({ reason: "Failed to get recently verified creators", error });
  }
};

export const getBookComments = async (bookId: string, defaultLimit = 3) => {
  try {
    const comments = await db.query.bookComments.findMany({
      where: eq(bookComments.bookId, bookId),
      limit: defaultLimit,
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
    if (wishlistedBooks.length === 0)
      return ok({ books: [], totalPages, page });
    return ok({ books: wishlistedBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books in wishlist", error);
    return err({ reason: "Failed to get books in wishlist", error });
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

    if (collectionBooks.length === 0)
      return ok({ books: [], totalPages, page });
    return ok({ books: collectionBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books in collection", error);
    return err({ reason: "Failed to get books in collection", error });
  }
};

export const getBooksByCreatorSlug = async (
  slug: string,
  currentPage: number = 1,
  sortBy:
    | "newest"
    | "oldest"
    | "title_asc"
    | "title_desc"
    | "creator_order" = "creator_order",
  defaultLimit = 16,
) => {
  const cacheKey = `${slug}:${currentPage}:${sortBy}:${defaultLimit}`;
  const cached = creatorCache.get(cacheKey);
  if (cached) return cached;

  try {
    // 1. Fetch creator without books
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug),
    });

    if (!creator) {
      return err({ reason: "Creator not found" });
    }

    const [booksResult, relatedCreatorsResult] = await Promise.all([
      getPublicBooksForCreator(creator, currentPage, { sortBy, defaultLimit }),
      getRelatedCreators(creator.id, creator.type),
    ]);

    if (booksResult[0]) {
      return booksResult;
    }

    const relatedCreators =
      Array.isArray(relatedCreatorsResult) && relatedCreatorsResult[1]
        ? relatedCreatorsResult[1]
        : { creators: [] };

    const result = ok({
      creator,
      books: booksResult[1].books,
      totalPages: booksResult[1].totalPages,
      page: booksResult[1].page,
      relatedCreators,
    });

    creatorCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.warn(error);
    return err({ reason: "Failed to get books by creator slug", error });
  }
};

export const getCreatorAndAssociatedCreatorsByCreatorSlugMobile = async (
  slug: string,
) => {
  try {
    // 1. Fetch creator without books
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug),
    });

    if (!creator) {
      return err({ reason: "Creator not found" });
    }

    const associatedCreators = await getRelatedCreators(
      creator.id,
      creator.type,
    );

    return ok({
      creator,
      associatedCreators,
    });
  } catch (error) {
    console.warn(error);
    return err({ reason: "Failed to get books by creator slug", error });
  }
};

export const getCreatorAboutBySlug = async (slug: string) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug),
    });

    if (!creator) {
      return err({ reason: "Creator not found" });
    }

    const relatedCreators = await getRelatedCreators(creator.id, creator.type);

    return ok({
      creator,
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
  // Only cache published books, not drafts (previews should always be fresh)
  const cacheKey = `${bookSlug}:${status}`;
  if (status === "published") {
    const cached = bookCache.get(cacheKey);
    if (cached) return cached;
  }

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

    if (!book) return err({ reason: "Book not found" });

    // Handle images - could be relation (bookImages[]) or field (string[])
    const galleryImages =
      book.images && Array.isArray(book.images) && book.images.length > 0
        ? typeof book.images[0] === "string"
          ? [] // If it's the string array field, we'll use bookImages relation instead
          : book.images.map((img: any) => ({ imageUrl: img.imageUrl }))
        : [];

    const result = ok({
      book: { ...book, images: galleryImages },
    });

    if (status === "published") {
      bookCache.set(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error("Failed to get book by slug", error);
    return err({ reason: "Failed to get book by slug", error });
  }
};

export const getBookCommentsBySlug = async (bookSlug: string) => {
  try {
    const book = await db.query.books.findFirst({
      columns: {
        id: true,
        title: true,
        slug: true,
      },
      where: and(
        eq(books.slug, bookSlug),
        eq(books.publicationStatus, "published"),
      ),
      with: {
        publisher: true,
        artist: true,
      },
    });
    if (!book) return err({ reason: "Book not found" });
    return ok(book);
  } catch (error) {
    console.error("Failed to get book info by slug", error);
    return err({ reason: "Failed to get book info by slug", error });
  }
};

export const getBookPublisherBySlug = async (bookSlug: string) => {
  try {
    const book = await db.query.books.findFirst({
      columns: {
        id: true,
        title: true,
        slug: true,
      },
      where: and(
        eq(books.slug, bookSlug),
        eq(books.publicationStatus, "published"),
      ),
      with: {
        publisher: true,
        artist: true,
      },
    });
    if (!book) return err({ reason: "Book not found" });
    return ok(book);
  } catch (error) {
    console.error("Failed to get book publisher by slug", error);
    return err({ reason: "Failed to get book publisher by slug", error });
  }
};

export const getBookAboutBySlug = async (bookSlug: string) => {
  try {
    const book = await db.query.books.findFirst({
      where: and(
        eq(books.slug, bookSlug),
        eq(books.publicationStatus, "published"),
      ),
      with: {
        publisher: true,
        artist: true,
      },
    });

    if (!book) return err({ reason: "Book not found" });

    return ok(book);
  } catch (error) {
    console.error("Failed to get book by slug", error);
    return err({ reason: "Failed to get book by slug", error });
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
    const tagCondition = tagMatchesBookTags(books.tags, tag);

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
          tagMatchesBookTags(books.tags, tag),
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

const catalogBookWith = {
  artist: {
    columns: CREATOR_CARD_COLUMNS,
  },
  publisher: {
    columns: CREATOR_CARD_COLUMNS,
  },
};

const findCatalogBooks = async ({
  where,
  limit,
  offset,
  sort,
}: {
  where?: SQL;
  limit: number;
  offset: number;
  sort: BookCatalogSort;
}) => {
  if (sort === "newest") {
    return db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where,
      limit,
      offset,
      orderBy: getBookCatalogOrderBy(sort),
      with: catalogBookWith,
    });
  }

  const viewCount = sql<number>`coalesce(count(${bookViews.id}), 0)`;
  const orderBy =
    sort === "trending"
      ? [desc(viewCount), desc(books.id)]
      : [asc(viewCount), asc(books.id)];

  const idRows = await db
    .select({ id: books.id })
    .from(books)
    .leftJoin(bookViews, eq(bookViews.bookId, books.id))
    .where(where)
    .groupBy(books.id)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  const bookIds = idRows.map((row) => row.id);
  if (bookIds.length === 0) return [];

  const foundBooks = await db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    where: inArray(books.id, bookIds),
    with: catalogBookWith,
  });

  const byId = new Map(foundBooks.map((book) => [book.id, book]));
  return bookIds
    .map((id) => byId.get(id))
    .filter((book): book is NonNullable<typeof book> => book !== undefined);
};

export const getLatestBooks = async (
  currentPage: number,
  defaultLimit = 15,
  sort: BookCatalogSort = "newest",
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

    const foundBooks = await findCatalogBooks({
      where: and(
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
      ),
      limit,
      offset,
      sort,
    });
    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books", error);
    return err({ reason: "Failed to get books" });
  }
};

const catalogBookCoverConditions = (tag: string) =>
  and(
    eq(books.publicationStatus, "published"),
    eq(books.approvalStatus, "approved"),
    or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
    isNotNull(books.coverUrl),
    tagMatchesBookTags(books.tags, tag),
  );

const getCoverUrlForTag = async (tag: string): Promise<string | null> => {
  const row = await db.query.books.findFirst({
    where: catalogBookCoverConditions(tag),
    columns: { coverUrl: true },
    orderBy: (fields, { desc }) => [
      sql`${fields.releaseDate} DESC NULLS LAST`,
      desc(fields.createdAt),
    ],
  });
  return row?.coverUrl ?? null;
};

export const loadFeaturedBookGroupCovers = async (): Promise<
  Map<string, string | null>
> => {
  const entries = await Promise.all(
    FEATURED_BOOK_GROUPS.map(
      async (tag) => [tag, await getCoverUrlForTag(tag)] as const,
    ),
  );
  return new Map(entries);
};

type GetFilteredBooksParams = {
  tag?: string | null;
  query?: string | null;
  page: number;
  limit?: number;
  sort?: BookCatalogSort;
};

export const getFilteredBooks = async ({
  tag,
  query,
  page: currentPage,
  limit: defaultLimit = 30,
  sort = "newest",
}: GetFilteredBooksParams) => {
  try {
    const normalizedTag = tag?.trim() ? slugToTag(tag.trim()) : null;
    const rawQ = query?.trim() ?? "";
    const searchQ = rawQ.length >= 3 ? rawQ : "";

    if (!normalizedTag && !searchQ) {
      return getLatestBooks(currentPage, defaultLimit, sort);
    }

    if (normalizedTag && !searchQ) {
      return getBooksByTagForCatalog(
        normalizedTag,
        currentPage,
        defaultLimit,
        sort,
      );
    }

    const publishedConditions = and(
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
      or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
    );

    const conditions = [publishedConditions];

    if (normalizedTag) {
      conditions.push(tagMatchesBookTags(books.tags, normalizedTag));
    }

    if (searchQ) {
      const searchPattern = `%${searchQ}%`;
      const matchingCreatorIds = db
        .select({ id: creators.id })
        .from(creators)
        .where(ilike(creators.displayName, searchPattern));

      conditions.push(
        or(
          ilike(books.title, searchPattern),
          inArray(books.artistId, matchingCreatorIds),
          inArray(books.publisherId, matchingCreatorIds),
          sql`EXISTS (
            SELECT 1
            FROM unnest(${books.tags}) AS tag
            WHERE LOWER(tag) LIKE ${searchPattern.toLowerCase()}
          )`,
        ),
      );
    }

    const whereClause = and(...conditions);

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(whereClause);

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundBooks = await findCatalogBooks({
      where: whereClause,
      limit,
      offset,
      sort,
    });

    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get filtered books", error);
    return err({ reason: "Failed to get filtered books", error });
  }
};

const getBooksByTagForCatalog = async (
  tag: string,
  currentPage: number,
  defaultLimit: number,
  sort: BookCatalogSort,
) => {
  const tagCondition = tagMatchesBookTags(books.tags, tag);

  const publishedConditions = and(
    eq(books.publicationStatus, "published"),
    eq(books.approvalStatus, "approved"),
    or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
    tagCondition,
  );

  const [{ value: totalCount = 0 }] = await db
    .select({ value: count() })
    .from(books)
    .where(publishedConditions);

  const { page, limit, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    defaultLimit,
  );

  const foundBooks = await findCatalogBooks({
    where: publishedConditions,
    limit,
    offset,
    sort,
  });

  return ok({ books: foundBooks, totalPages, page });
};

export const filterPublishedBooks = async (searchQuery: string, limit = 50) => {
  try {
    const query = searchQuery.trim();
    if (!query) {
      return getLatestBooks(1, limit);
    }
    return getFilteredBooks({ query, page: 1, limit });
  } catch (error) {
    console.error("Failed to filter books", error);
    return err({ reason: "Failed to filter books" });
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
    if (feedBooks.length === 0) return ok({ books: [], totalPages, page });
    return ok({ books: feedBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get feed books", error);
    return err({ reason: "Failed to get feed books", error });
  }
};

export const getFollowerFeed = async (
  followerUserId: string,
  currentPage = 1,
  limit = 20,
  options?: { includeMessages?: boolean },
) => {
  const includeMessages =
    options?.includeMessages ?? isFeatureEnabled("messages");

  try {
    const userFollows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, followerUserId),
        eq(follows.targetType, "creator"),
      ),
    });

    const followedCreatorIds = userFollows
      .map((follow) => follow.targetCreatorId)
      .filter((id): id is string => id !== null);

    if (followedCreatorIds.length === 0) {
      return ok({ items: [], totalPages: 0, page: 1 });
    }

    const bookWhere = and(
      or(
        inArray(books.artistId, followedCreatorIds),
        inArray(books.publisherId, followedCreatorIds),
      ),
      eq(books.publicationStatus, "published"),
      or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
    );
    const messageWhere = inArray(
      creatorMessages.creatorId,
      followedCreatorIds,
    );

    const [{ value: bookCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(bookWhere);

    const [{ value: messageCount = 0 }] = includeMessages
      ? await db
          .select({ value: count() })
          .from(creatorMessages)
          .where(messageWhere)
      : [{ value: 0 }];

    const totalCount = bookCount + messageCount;
    const { page, totalPages } = getPagination(
      currentPage,
      totalCount,
      limit,
    );
    const fetchLimit = page * limit;

    const [feedBooks, feedMessages] = await Promise.all([
      db.query.books.findMany({
        where: bookWhere,
        columns: { ...BOOK_CARD_COLUMNS, createdAt: true },
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS },
        },
        orderBy: getBooksOrderBy("newest"),
        limit: fetchLimit,
      }),
      includeMessages
        ? db.query.creatorMessages.findMany({
            where: messageWhere,
            orderBy: [desc(creatorMessages.createdAt)],
            limit: fetchLimit,
            with: {
              creator: {
                columns: {
                  id: true,
                  displayName: true,
                  slug: true,
                  coverUrl: true,
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const items = mergeFeedItems(feedBooks, feedMessages, page, limit);

    return ok({ items, totalPages, page });
  } catch (error) {
    console.error("Failed to get follower feed", error);
    return err({ reason: "Failed to get follower feed", error });
  }
};

export const getAllCreatorsByType = async (
  type: "artist" | "publisher",
  currentPage: number = 1,
  defaultLimit = 30,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(creators)
      .where(
        and(
          eq(creators.type, type),
          sql`EXISTS (
            SELECT 1 FROM ${books}
            WHERE (${books.artistId} = ${creators.id} OR ${books.publisherId} = ${creators.id})
            AND ${books.publicationStatus} = 'published'
          )`,
        ),
      );

    const { page, offset, totalPages, limit } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundCreators = await db.query.creators.findMany({
      where: eq(creators.type, type),
      orderBy: (creators, { asc }) => [asc(creators.displayName)],
      offset,
      limit,
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

    return ok({ creators: creatorsWithBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get all creators by type", error);
    return err({ reason: "Failed to get all creators by type", error });
  }
};

const creatorsWithPublishedBooks = sql`EXISTS (
  SELECT 1 FROM ${books}
  WHERE (${books.artistId} = ${creators.id} OR ${books.publisherId} = ${creators.id})
  AND ${books.publicationStatus} = 'published'
)`;

export const getAllCreatorsForBrowse = async (
  currentPage: number = 1,
  defaultLimit = 50,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(creators)
      .where(creatorsWithPublishedBooks);

    const { page, offset, totalPages, limit } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundCreators = await db
      .select(CREATOR_CARD_SELECT)
      .from(creators)
      .where(creatorsWithPublishedBooks)
      .orderBy(asc(creators.displayName))
      .offset(offset)
      .limit(limit);

    return ok({ creators: foundCreators, totalPages, page });
  } catch (error) {
    console.error("Failed to get all creators", error);
    return err({ reason: "Failed to get all creators", error });
  }
};

export const filterPublishedCreators = async (
  searchQuery: string,
  limit = 50,
) => {
  try {
    const q = searchQuery.trim();
    if (!q) {
      return getAllCreatorsForBrowse(1, limit);
    }

    const searchPattern = `%${q}%`;
    const foundCreators = await db
      .select(CREATOR_CARD_SELECT)
      .from(creators)
      .where(
        and(
          creatorsWithPublishedBooks,
          ilike(creators.displayName, searchPattern),
        ),
      )
      .orderBy(asc(creators.displayName))
      .limit(limit);

    return ok({ creators: foundCreators, totalPages: 1, page: 1 });
  } catch (error) {
    console.error("Failed to filter creators", error);
    return err({ reason: "Failed to filter creators" });
  }
};

export const searchCreators = async (
  searchQuery: string,
  limit: number = 5,
) => {
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
      limit,
    });

    const result = foundCreators.filter(
      (creator) =>
        creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0,
    );
    if (result.length === 0) return ok([]);
    return ok(result);
  } catch (error) {
    console.error("Failed to search creators", error);
    return err({ reason: "Failed to search creators", error });
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
) => {
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

    if (result.length >= limit) return ok({ books: result.slice(0, limit) });

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

    if (result.length >= limit) return ok({ books: result.slice(0, limit) });

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

    if (result.length >= limit) return ok({ books: result.slice(0, limit) });
    return ok({ books: result });
  } catch (error) {
    console.error("Failed to get related books", error);
    return err({ reason: "Failed to get related books", error });
  }
};

export const getCreatorsByCreatorId = async (
  creatorId: string,
  creatorType: "artist" | "publisher",
  currentPage: number = 1,
  defaultLimit = 10,
) => {
  try {
    const relatedColumn =
      creatorType === "publisher" ? books.artistId : books.publisherId;
    const myColumn =
      creatorType === "publisher" ? books.publisherId : books.artistId;

    const peerColumnFilter =
      creatorType === "publisher"
        ? isNotNull(books.artistId)
        : isNotNull(books.publisherId);

    const publishedBooks = await db
      .selectDistinct({ relatedId: relatedColumn })
      .from(books)
      .where(
        and(
          eq(myColumn, creatorId),
          peerColumnFilter,
          eq(books.publicationStatus, "published"),
          eq(books.approvalStatus, "approved"),
          or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
        ),
      );

    const relatedIds = publishedBooks
      .map((r) => r.relatedId)
      .filter((id): id is string => id != null);

    if (relatedIds.length === 0)
      return ok({ creators: [], totalPages: 1, page: 1 });

    const totalCount = relatedIds.length;
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundCreators = await db.query.creators.findMany({
      columns: CREATOR_CARD_COLUMNS,
      where: inArray(creators.id, relatedIds),
      orderBy: (c, { asc }) => [asc(c.displayName)],
      limit,
      offset,
    });

    return ok({ creators: foundCreators ?? [], totalPages, page });
  } catch (error) {
    console.error("Failed to get related creators", error);
    return err({ reason: "Failed to get related creators", error });
  }
};

export const getRelatedCreators = async (
  creatorId: string,
  creatorType: "artist" | "publisher",
) => {
  try {
    const relatedColumn =
      creatorType === "publisher" ? books.artistId : books.publisherId;
    const joinColumn =
      creatorType === "publisher" ? books.artistId : books.publisherId;
    const myColumn =
      creatorType === "publisher" ? books.publisherId : books.artistId;
    const peerColumnFilter =
      creatorType === "publisher"
        ? isNotNull(books.artistId)
        : isNotNull(books.publisherId);

    const related = await db
      .selectDistinct(CREATOR_CARD_SELECT)
      .from(creators)
      .innerJoin(books, eq(joinColumn, creators.id))
      .where(
        and(
          eq(myColumn, creatorId),
          peerColumnFilter,
          eq(books.publicationStatus, "published"),
          eq(books.approvalStatus, "approved"),
          or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
        ),
      );
    if (related.length === 0) return ok({ creators: [] });
    return ok({ creators: related });
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
      return ok({ messages: [], totalPages: 0, page: 1 });
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
    return ok({ messages, totalPages, page });
  } catch (e) {
    console.error("Failed to get messages for follower", e);
    return err({ reason: "Failed to get messages for follower", error: e });
  }
};

export const getHomepageStats = async () => {
  try {
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
    return ok({
      books: booksCountResult[0]?.value ?? 0,
      artists: artistsCountResult[0]?.value ?? 0,
      publishers: publishersCountResult[0]?.value ?? 0,
    });
  } catch (error) {
    console.error("Failed to get homepage stats", error);
    return err({ reason: "Failed to get homepage stats", error });
  }
};

export const getFollowedCreatorsForBrowse = async (
  followerUserId: string,
  currentPage = 1,
  defaultLimit = 48,
) => {
  try {
    const followMatch = and(
      eq(follows.targetCreatorId, creators.id),
      eq(follows.followerUserId, followerUserId),
      eq(follows.targetType, "creator"),
    );

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(creators)
      .innerJoin(follows, followMatch)
      .where(creatorsWithPublishedBooks);

    const { page, offset, totalPages, limit } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundCreators = await db
      .select(CREATOR_CARD_SELECT)
      .from(creators)
      .innerJoin(follows, followMatch)
      .where(creatorsWithPublishedBooks)
      .orderBy(asc(creators.displayName))
      .offset(offset)
      .limit(limit);

    return ok({ creators: foundCreators, totalPages, page });
  } catch (error) {
    console.error("Failed to get followed creators for browse", error);
    return err({ reason: "Failed to get followed creators for browse", error });
  }
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

/** Covers and gallery images from a creator's recent published books. */
export async function getCreatorSpotlightImageUrls(
  creatorType: "publisher" | "artist",
  creatorId: string,
  bookLimit = 12,
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
        or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
      ),
      orderBy: (b, { desc: d }) => [d(b.releaseDate), d(b.createdAt)],
      limit: bookLimit,
      with: {
        images: {
          columns: { imageUrl: true },
          orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
        },
      },
    });

    const urls = new Set<string>();
    for (const book of rows) {
      if (book.coverUrl) urls.add(book.coverUrl);
      for (const image of book.images ?? []) {
        if (image.imageUrl) urls.add(image.imageUrl);
      }
    }

    return ok([...urls]);
  } catch (e) {
    console.error("getCreatorSpotlightImageUrls", e);
    return err({
      reason: "Failed to get spotlight image urls for creator catalogue",
      error: e,
    });
  }
}

export const getMessagesByCreatorSlug = async (
  creatorSlug: string,
  currentPage = 1,
  limit = 20,
) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, creatorSlug),
      columns: {
        id: true,
        slug: true,
        displayName: true,
        coverUrl: true,
        type: true,
      },
    });
    if (!creator) return err({ reason: "Creator not found" });
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(creatorMessages)
      .where(eq(creatorMessages.creatorId, creator.id));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      5,
    );

    const foundMessages = await db.query.creatorMessages.findMany({
      where: eq(creatorMessages.creatorId, creator.id),
      orderBy: [desc(creatorMessages.createdAt)],
      limit,
      offset,
      with: {
        creator: {
          columns: { id: true, slug: true, displayName: true, coverUrl: true },
        },
      },
    });
    return ok({ messages: foundMessages ?? [], totalPages, page, creator });
  } catch (error) {
    console.error("Failed to get messages by creator slug", error);
    return err({ reason: "Failed to get messages by creator slug", error });
  }
};

export const getPublishedInterviews = async () => {
  try {
    const interviews = await db.query.creatorInterviews.findMany({
      columns: {
        id: true,
        creatorId: true,
        status: true,
        completedAt: true,
        promoImageUrl: true,
        answers: true,
      },
      orderBy: [desc(creatorInterviews.completedAt)],
      where: and(
        eq(creatorInterviews.status, "published"),
        isNotNull(creatorInterviews.promoImageUrl),
      ),
      with: {
        creator: {
          columns: { id: true, displayName: true, slug: true, coverUrl: true },
        },
      },
    });

    return ok(interviews);
  } catch (error) {
    console.error("Failed to get interviews", error);
    return err({ reason: "Failed to get interviews", error });
  }
};

export const getInterviewByCreatorSlug = async (slug: string) => {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.creatorSlug, slug),
      with: {
        creator: {
          columns: {
            id: true,
            displayName: true,
            slug: true,
            coverUrl: true,
            type: true,
          },
          with: {
            booksAsArtist: {
              columns: { id: true, title: true, slug: true, coverUrl: true },
              where: and(
                eq(books.publicationStatus, "published"),
                eq(books.approvalStatus, "approved"),
              ),
              orderBy: (b, { desc }) => [
                desc(b.releaseDate),
                desc(b.createdAt),
              ],
              limit: 1,
              with: {
                images: {
                  columns: { id: true, imageUrl: true },
                  orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
                },
              },
            },
            booksAsPublisher: {
              columns: { id: true, title: true, slug: true, coverUrl: true },
              where: and(
                eq(books.publicationStatus, "published"),
                eq(books.approvalStatus, "approved"),
              ),
              orderBy: (b, { desc }) => [
                desc(b.releaseDate),
                desc(b.createdAt),
              ],
              limit: 1,
              with: {
                images: {
                  columns: { id: true, imageUrl: true },
                  orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
                },
              },
            },
          },
        },
      },
    });
    return ok(interview);
  } catch (error) {
    console.error("Failed to get interview by creator slug", error);
    return err({ reason: "Failed to get interview by creator slug", error });
  }
};

export const getInterviewById = async (interviewId: string) => {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.id, interviewId),
      with: {
        creator: {
          columns: CREATOR_CARD_COLUMNS,
        },
      },
    });
    return ok(interview);
  } catch (error) {
    console.error("Failed to get interview by creator slug", error);
    return err({ reason: "Failed to get interview by creator slug", error });
  }
};

/**
 * Update the signed-in user's own name. Writes both the DB row and the
 * Supabase auth user_metadata, because login (auth/set-session) re-syncs
 * firstName/lastName from user_metadata into the users table — a DB-only
 * update would be overwritten on the next sign-in.
 */
export const updateOwnUserProfile = async (
  userId: string,
  data: { firstName?: string | null; lastName?: string | null },
) => {
  try {
    const firstName = data.firstName ?? null;
    const lastName = data.lastName ?? null;

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: { firstName, lastName } },
    );
    if (authError) {
      return err({
        reason: authError.message || "Failed to update profile",
        cause: authError,
      });
    }

    const [updated] = await db
      .update(users)
      .set({ firstName, lastName, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) return err({ reason: "Failed to update profile" });
    return ok(updated);
  } catch (error) {
    console.error("Failed to update user profile", error);
    return err({ reason: "Failed to update profile", cause: error });
  }
};
