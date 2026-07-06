import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  or,
  sql
} from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  bookComments,
  books,
  bookViews,
  collectionItems,
  creatorInterviews,
  creators,
  follows,
  wishlists
} from "../../db/schema.js";
import { getPagination } from "../../lib/pagination.js";
import {
  getBookCatalogOrderBy
} from "../../lib/bookCatalogSort.js";
import { getPublicBooksForCreator } from "../../domain/creators/books.js";
import { getBooksOrderBy } from "../../lib/booksOrderBy.js";
import { slugToTag } from "../../lib/tags.js";
import { FEATURED_BOOK_GROUPS } from "../../constants/featuredBookGroups.js";
import {
  BOOK_CARD_COLUMNS,
  CREATOR_CARD_COLUMNS,
  CREATOR_CARD_SELECT
} from "../../constants/queries.js";
import { creatorMessages } from "../../db/schema.js";
import { err, ok } from "../../lib/result.js";
import { LRUCache } from "lru-cache";
const bookCache = new LRUCache({
  max: 200,
  ttl: 1e3 * 60 * 5
});
const creatorCache = new LRUCache({
  max: 200,
  ttl: 1e3 * 60 * 5
});
const invalidateBookCache = (slug) => {
  bookCache.delete(`${slug}:published`);
  bookCache.delete(`${slug}:draft`);
};
const invalidateCreatorCache = (slug) => {
  for (const key of creatorCache.keys()) {
    if (key.startsWith(`${slug}:`)) {
      creatorCache.delete(key);
    }
  }
};
const getDisplayName = (commentUser) => {
  if (!commentUser) return "Unknown user";
  const fullName = [commentUser.firstName, commentUser.lastName].filter(Boolean).join(" ").trim();
  return fullName || commentUser.email;
};
const getVerifiedCreators = async () => {
  try {
    const foundCreators = await db.query.creators.findMany({
      where: eq(creators.status, "verified"),
      columns: CREATOR_CARD_COLUMNS,
      with: {
        booksAsArtist: {
          columns: { id: true },
          where: eq(books.publicationStatus, "published")
        },
        booksAsPublisher: {
          columns: { id: true },
          where: eq(books.publicationStatus, "published")
        }
      }
    });
    const verifiedCreatorsWithPublishedBooks = foundCreators.filter(
      (creator) => creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0
    ).map(({ booksAsArtist, booksAsPublisher, ...creator }) => creator);
    return ok(verifiedCreatorsWithPublishedBooks);
  } catch (error) {
    console.error("Failed to get verified creators", error);
    return err({ reason: "Failed to get verified creators", error });
  }
};
const getRecentlyVerifiedCreators = async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const foundCreators = await db.query.creators.findMany({
      where: and(
        eq(creators.status, "verified"),
        isNotNull(creators.verifiedAt),
        gte(creators.verifiedAt, cutoff)
      ),
      columns: {
        id: true,
        slug: true,
        displayName: true,
        type: true
      },
      with: {
        booksAsArtist: {
          columns: { id: true },
          where: eq(books.publicationStatus, "published")
        },
        booksAsPublisher: {
          columns: { id: true },
          where: eq(books.publicationStatus, "published")
        }
      },
      orderBy: [asc(creators.verifiedAt)]
    });
    const recentlyVerifiedWithPublishedBooks = foundCreators.filter(
      (creator) => creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0
    ).map(({ booksAsArtist, booksAsPublisher, ...creator }) => creator);
    return ok(recentlyVerifiedWithPublishedBooks);
  } catch (error) {
    console.error("Failed to get recently verified creators", error);
    return err({ reason: "Failed to get recently verified creators", error });
  }
};
const getBookComments = async (bookId, defaultLimit = 3) => {
  try {
    const comments = await db.query.bookComments.findMany({
      where: eq(bookComments.bookId, bookId),
      limit: defaultLimit,
      orderBy: (bookComments2, { desc: desc2 }) => [desc2(bookComments2.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImageUrl: true
          },
          with: {
            creators: {
              columns: CREATOR_CARD_COLUMNS
            }
          }
        }
      }
    });
    if (!comments) return err({ reason: "No comments found" });
    return ok(comments);
  } catch (error) {
    console.error("Failed to get book comments", error);
    return err({ reason: "Failed to get book comments", error });
  }
};
const getCommentById = async (commentId) => {
  try {
    const comment = await db.query.bookComments.findFirst({
      where: eq(bookComments.id, commentId)
    });
    return ok(comment);
  } catch (error) {
    console.error("Failed to get comment by id", error);
    return err({ reason: "Failed to get comment by id", error });
  }
};
const updateCommentById = async (commentId, body) => {
  try {
    const updatedComment = await db.update(bookComments).set({ body }).where(eq(bookComments.id, commentId)).returning();
    if (!updatedComment) return err({ reason: "Comment not found" });
    return ok(updatedComment[0] ?? null);
  } catch (error) {
    console.error("Failed to update comment", error);
    return err({ reason: "Failed to update comment", error });
  }
};
const deleteCommentById = async (commentId) => {
  try {
    await db.delete(bookComments).where(eq(bookComments.id, commentId));
    return ok(void 0);
  } catch (error) {
    console.error("Failed to delete comment", error);
    return err({ reason: "Failed to delete comment", error });
  }
};
const getBooksInWishlist = async (userId, currentPage, sortBy = "newest", defaultLimit = 12) => {
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(wishlists).where(eq(wishlists.userId, userId));
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const wishlistItems = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, userId)
    });
    const wishlistedBooks = await db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where: inArray(
        books.id,
        wishlistItems.map((wishlist) => wishlist.bookId)
      ),
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS
        }
      },
      orderBy: getBooksOrderBy(sortBy),
      limit,
      offset
    });
    if (wishlistedBooks.length === 0)
      return ok({ books: [], totalPages, page });
    return ok({ books: wishlistedBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books in wishlist", error);
    return err({ reason: "Failed to get books in wishlist", error });
  }
};
const getBooksInCollection = async (userId, currentPage, sortBy = "newest", defaultLimit = 12) => {
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(collectionItems).where(eq(collectionItems.userId, userId));
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundCollectionItems = await db.query.collectionItems.findMany({
      where: eq(collectionItems.userId, userId)
    });
    const collectionBooks = await db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where: inArray(
        books.id,
        foundCollectionItems.map((collectionItem) => collectionItem.bookId)
      ),
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS
        }
      },
      orderBy: getBooksOrderBy(sortBy),
      limit,
      offset
    });
    if (collectionBooks.length === 0)
      return ok({ books: [], totalPages, page });
    return ok({ books: collectionBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books in collection", error);
    return err({ reason: "Failed to get books in collection", error });
  }
};
const getBooksByCreatorSlug = async (slug, currentPage = 1, sortBy = "creator_order", defaultLimit = 16) => {
  const cacheKey = `${slug}:${currentPage}:${sortBy}:${defaultLimit}`;
  const cached = creatorCache.get(cacheKey);
  if (cached) return cached;
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug)
    });
    if (!creator) {
      return err({ reason: "Creator not found" });
    }
    const [booksResult, relatedCreatorsResult] = await Promise.all([
      getPublicBooksForCreator(creator, currentPage, { sortBy, defaultLimit }),
      getRelatedCreators(creator.id, creator.type)
    ]);
    if (booksResult[0]) {
      return booksResult;
    }
    const relatedCreators = Array.isArray(relatedCreatorsResult) && relatedCreatorsResult[1] ? relatedCreatorsResult[1] : { creators: [] };
    const result = ok({
      creator,
      books: booksResult[1].books,
      totalPages: booksResult[1].totalPages,
      page: booksResult[1].page,
      relatedCreators
    });
    creatorCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(error);
    return err({ reason: "Failed to get books by creator slug", error });
  }
};
const getCreatorAndAssociatedCreatorsByCreatorSlugMobile = async (slug) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug)
    });
    if (!creator) {
      return err({ reason: "Creator not found" });
    }
    const associatedCreators = await getRelatedCreators(
      creator.id,
      creator.type
    );
    return ok({
      creator,
      associatedCreators
    });
  } catch (error) {
    console.warn(error);
    return err({ reason: "Failed to get books by creator slug", error });
  }
};
const getCreatorAboutBySlug = async (slug) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, slug)
    });
    if (!creator) {
      return err({ reason: "Creator not found" });
    }
    const relatedCreators = await getRelatedCreators(creator.id, creator.type);
    return ok({
      creator,
      relatedCreators
    });
  } catch (error) {
    console.warn(error);
    return err({ reason: "Failed to get books by creator slug", error });
  }
};
const getBookBySlug = async (bookSlug, status = "published") => {
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
          orderBy: (bookImages, { asc: asc2 }) => [asc2(bookImages.sortOrder)]
        }
      }
    });
    if (!book) return err({ reason: "Book not found" });
    const galleryImages = book.images && Array.isArray(book.images) && book.images.length > 0 ? typeof book.images[0] === "string" ? [] : book.images.map((img) => ({ imageUrl: img.imageUrl })) : [];
    const result = ok({
      book: { ...book, images: galleryImages }
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
const getBookCommentsBySlug = async (bookSlug) => {
  try {
    const book = await db.query.books.findFirst({
      columns: {
        id: true,
        title: true,
        slug: true
      },
      where: and(
        eq(books.slug, bookSlug),
        eq(books.publicationStatus, "published")
      ),
      with: {
        publisher: true,
        artist: true
      }
    });
    if (!book) return err({ reason: "Book not found" });
    return ok(book);
  } catch (error) {
    console.error("Failed to get book info by slug", error);
    return err({ reason: "Failed to get book info by slug", error });
  }
};
const getBookPublisherBySlug = async (bookSlug) => {
  try {
    const book = await db.query.books.findFirst({
      columns: {
        id: true,
        title: true,
        slug: true
      },
      where: and(
        eq(books.slug, bookSlug),
        eq(books.publicationStatus, "published")
      ),
      with: {
        publisher: true,
        artist: true
      }
    });
    if (!book) return err({ reason: "Book not found" });
    return ok(book);
  } catch (error) {
    console.error("Failed to get book publisher by slug", error);
    return err({ reason: "Failed to get book publisher by slug", error });
  }
};
const getBookAboutBySlug = async (bookSlug) => {
  try {
    const book = await db.query.books.findFirst({
      where: and(
        eq(books.slug, bookSlug),
        eq(books.publicationStatus, "published")
      ),
      with: {
        publisher: true,
        artist: true
      }
    });
    if (!book) return err({ reason: "Book not found" });
    return ok(book);
  } catch (error) {
    console.error("Failed to get book by slug", error);
    return err({ reason: "Failed to get book by slug", error });
  }
};
const getFirstBookByTag = async (tag) => {
  try {
    const [error, result] = await getBooksByTag(tag, 1, "newest", 1);
    if (error) return err({ reason: "Failed to get first book by tag", error });
    const { books: books2 } = result;
    return ok(books2[0]);
  } catch (error) {
    console.error("Failed to get first book by tag", error);
    return err({ reason: "Failed to get first book by tag" });
  }
};
const getBooksByTag = async (tag, currentPage, sortBy = "newest", defaultLimit = 12) => {
  try {
    const tagCondition = sql`EXISTS (
      SELECT 1 FROM unnest(${books.tags}) AS t
      WHERE LOWER(t) = LOWER(${tag})
    )`;
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(and(eq(books.publicationStatus, "published"), tagCondition));
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundBooks = await db.query.books.findMany({
      where: (books2, { and: and2, eq: eq2, sql: sql2 }) => and2(
        eq2(books2.publicationStatus, "published"),
        sql2`EXISTS (
            SELECT 1 FROM unnest(${books2.tags}) AS t
            WHERE LOWER(t) = LOWER(${tag})
          )`,
        or(isNull(books2.releaseDate), lte(books2.releaseDate, /* @__PURE__ */ new Date()))
      ),
      columns: BOOK_CARD_COLUMNS,
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS
        }
      },
      orderBy: getBooksOrderBy(sortBy),
      limit,
      offset
    });
    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books by tag", error);
    return err({ reason: "Failed to get books by tag", error });
  }
};
const catalogBookWith = {
  artist: {
    columns: CREATOR_CARD_COLUMNS
  },
  publisher: {
    columns: CREATOR_CARD_COLUMNS
  }
};
const findCatalogBooks = async ({
  where,
  limit,
  offset,
  sort
}) => {
  if (sort === "newest") {
    return db.query.books.findMany({
      columns: BOOK_CARD_COLUMNS,
      where,
      limit,
      offset,
      orderBy: getBookCatalogOrderBy(sort),
      with: catalogBookWith
    });
  }
  const viewCount = sql`coalesce(count(${bookViews.id}), 0)`;
  const orderBy = sort === "trending" ? [desc(viewCount), desc(books.id)] : [asc(viewCount), asc(books.id)];
  const idRows = await db.select({ id: books.id }).from(books).leftJoin(bookViews, eq(bookViews.bookId, books.id)).where(where).groupBy(books.id).orderBy(...orderBy).limit(limit).offset(offset);
  const bookIds = idRows.map((row) => row.id);
  if (bookIds.length === 0) return [];
  const foundBooks = await db.query.books.findMany({
    columns: BOOK_CARD_COLUMNS,
    where: inArray(books.id, bookIds),
    with: catalogBookWith
  });
  const byId = new Map(foundBooks.map((book) => [book.id, book]));
  return bookIds.map((id) => byId.get(id)).filter((book) => book !== void 0);
};
const getLatestBooks = async (currentPage, defaultLimit = 15, sort = "newest") => {
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(eq(books.publicationStatus, "published"));
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundBooks = await findCatalogBooks({
      where: and(
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
      ),
      limit,
      offset,
      sort
    });
    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get books", error);
    return err({ reason: "Failed to get books" });
  }
};
const catalogBookCoverConditions = (tag) => and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date())),
  isNotNull(books.coverUrl),
  sql`EXISTS (
      SELECT 1 FROM unnest(${books.tags}) AS t
      WHERE LOWER(t) = LOWER(${tag})
    )`
);
const getCoverUrlForTag = async (tag) => {
  const row = await db.query.books.findFirst({
    where: catalogBookCoverConditions(tag),
    columns: { coverUrl: true },
    orderBy: (fields, { desc: desc2 }) => [
      sql`${fields.releaseDate} DESC NULLS LAST`,
      desc2(fields.createdAt)
    ]
  });
  return row?.coverUrl ?? null;
};
const loadFeaturedBookGroupCovers = async () => {
  const entries = await Promise.all(
    FEATURED_BOOK_GROUPS.map(
      async (tag) => [tag, await getCoverUrlForTag(tag)]
    )
  );
  return new Map(entries);
};
const getFilteredBooks = async ({
  tag,
  query,
  page: currentPage,
  limit: defaultLimit = 30,
  sort = "newest"
}) => {
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
        sort
      );
    }
    const publishedConditions = and(
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
      or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
    );
    const conditions = [publishedConditions];
    if (normalizedTag) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM unnest(${books.tags}) AS t
          WHERE LOWER(t) = LOWER(${normalizedTag})
        )`
      );
    }
    if (searchQ) {
      const searchPattern = `%${searchQ}%`;
      const matchingCreatorIds = db.select({ id: creators.id }).from(creators).where(ilike(creators.displayName, searchPattern));
      conditions.push(
        or(
          ilike(books.title, searchPattern),
          inArray(books.artistId, matchingCreatorIds),
          inArray(books.publisherId, matchingCreatorIds),
          sql`EXISTS (
            SELECT 1
            FROM unnest(${books.tags}) AS tag
            WHERE LOWER(tag) LIKE ${searchPattern.toLowerCase()}
          )`
        )
      );
    }
    const whereClause = and(...conditions);
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(whereClause);
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundBooks = await findCatalogBooks({
      where: whereClause,
      limit,
      offset,
      sort
    });
    return ok({ books: foundBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get filtered books", error);
    return err({ reason: "Failed to get filtered books", error });
  }
};
const getBooksByTagForCatalog = async (tag, currentPage, defaultLimit, sort) => {
  const tagCondition = sql`EXISTS (
    SELECT 1 FROM unnest(${books.tags}) AS t
    WHERE LOWER(t) = LOWER(${tag})
  )`;
  const publishedConditions = and(
    eq(books.publicationStatus, "published"),
    eq(books.approvalStatus, "approved"),
    or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date())),
    tagCondition
  );
  const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(books).where(publishedConditions);
  const { page, limit, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    defaultLimit
  );
  const foundBooks = await findCatalogBooks({
    where: publishedConditions,
    limit,
    offset,
    sort
  });
  return ok({ books: foundBooks, totalPages, page });
};
const filterPublishedBooks = async (searchQuery, limit = 50) => {
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
const getFeedBooks = async (userId, currentPage, sortBy = "newest", defaultLimit = 12) => {
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(follows).where(eq(follows.followerUserId, userId));
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const userFollows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, userId),
        eq(follows.targetType, "creator")
      )
    });
    const followedCreatorIds = userFollows.map((follow) => follow.targetCreatorId).filter((id) => id !== null);
    const feedBooks = await db.query.books.findMany({
      where: and(
        or(
          inArray(books.artistId, followedCreatorIds),
          inArray(books.publisherId, followedCreatorIds)
        ),
        eq(books.publicationStatus, "published"),
        or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
      ),
      columns: BOOK_CARD_COLUMNS,
      with: {
        artist: {
          columns: CREATOR_CARD_COLUMNS
        },
        publisher: {
          columns: CREATOR_CARD_COLUMNS
        }
      },
      orderBy: getBooksOrderBy(sortBy),
      limit,
      offset
    });
    if (feedBooks.length === 0) return ok({ books: [], totalPages, page });
    return ok({ books: feedBooks, totalPages, page });
  } catch (error) {
    console.error("Failed to get feed books", error);
    return err({ reason: "Failed to get feed books", error });
  }
};
const getAllCreatorsByType = async (type, currentPage = 1, defaultLimit = 30) => {
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(creators).where(
      and(
        eq(creators.type, type),
        sql`EXISTS (
            SELECT 1 FROM ${books}
            WHERE (${books.artistId} = ${creators.id} OR ${books.publisherId} = ${creators.id})
            AND ${books.publicationStatus} = 'published'
          )`
      )
    );
    const { page, offset, totalPages, limit } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundCreators = await db.query.creators.findMany({
      where: eq(creators.type, type),
      orderBy: (creators2, { asc: asc2 }) => [asc2(creators2.displayName)],
      offset,
      limit,
      with: {
        booksAsArtist: {
          where: eq(books.publicationStatus, "published")
        },
        booksAsPublisher: {
          where: eq(books.publicationStatus, "published")
        }
      }
    });
    const creatorsWithBooks = foundCreators.filter(
      (creator) => creator.booksAsArtist.length + creator.booksAsPublisher.length >= 1
    ).map((creator) => ({
      ...creator,
      books: creator.booksAsArtist.length + creator.booksAsPublisher.length
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
const getAllCreatorsForBrowse = async (currentPage = 1, defaultLimit = 50) => {
  try {
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(creators).where(creatorsWithPublishedBooks);
    const { page, offset, totalPages, limit } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundCreators = await db.select(CREATOR_CARD_SELECT).from(creators).where(creatorsWithPublishedBooks).orderBy(asc(creators.displayName)).offset(offset).limit(limit);
    return ok({ creators: foundCreators, totalPages, page });
  } catch (error) {
    console.error("Failed to get all creators", error);
    return err({ reason: "Failed to get all creators", error });
  }
};
const filterPublishedCreators = async (searchQuery, limit = 50) => {
  try {
    const q = searchQuery.trim();
    if (!q) {
      return getAllCreatorsForBrowse(1, limit);
    }
    const searchPattern = `%${q}%`;
    const foundCreators = await db.select(CREATOR_CARD_SELECT).from(creators).where(
      and(
        creatorsWithPublishedBooks,
        ilike(creators.displayName, searchPattern)
      )
    ).orderBy(asc(creators.displayName)).limit(limit);
    return ok({ creators: foundCreators, totalPages: 1, page: 1 });
  } catch (error) {
    console.error("Failed to filter creators", error);
    return err({ reason: "Failed to filter creators" });
  }
};
const searchCreators = async (searchQuery, limit = 5) => {
  try {
    const foundCreators = await db.query.creators.findMany({
      columns: {
        id: true,
        displayName: true,
        slug: true,
        coverUrl: true,
        status: true,
        type: true
      },
      where: and(
        ilike(creators.displayName, `%${searchQuery}%`)
        // exists(db.select().from(books).where(eq(books.artistId, creators.id))),
      ),
      with: {
        booksAsArtist: {
          where: eq(books.publicationStatus, "published")
        },
        booksAsPublisher: {
          where: eq(books.publicationStatus, "published")
        }
      },
      orderBy: (creators2, { asc: asc2 }) => [asc2(creators2.displayName)],
      limit
    });
    const result = foundCreators.filter(
      (creator) => creator.booksAsArtist.length > 0 || creator.booksAsPublisher.length > 0
    );
    if (result.length === 0) return ok([]);
    return ok(result);
  } catch (error) {
    console.error("Failed to search creators", error);
    return err({ reason: "Failed to search creators", error });
  }
};
const getRelatedBooks = async (currentBookId, options, limit = 10) => {
  try {
    const seenIds = /* @__PURE__ */ new Set([currentBookId]);
    const result = [];
    const baseConditions = and(
      ne(books.id, currentBookId),
      eq(books.publicationStatus, "published"),
      eq(books.approvalStatus, "approved"),
      or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
    );
    if (options.artistId) {
      const byArtist = await db.query.books.findMany({
        columns: BOOK_CARD_COLUMNS,
        where: and(baseConditions, eq(books.artistId, options.artistId)),
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS }
        },
        orderBy: (books2, { desc: desc2 }) => [desc2(books2.releaseDate)],
        limit
      });
      for (const b of byArtist) {
        result.push(b);
        seenIds.add(b.id);
      }
    }
    if (result.length >= limit) return ok({ books: result.slice(0, limit) });
    const tagsNormalized = options.tags?.map((x) => x.trim().toLowerCase()).filter(Boolean) ?? [];
    if (tagsNormalized.length > 0) {
      const tagCondition = sql`EXISTS (
        SELECT 1 FROM unnest(${books.tags}) AS t
        WHERE LOWER(TRIM(t)) IN (${sql.join(
        tagsNormalized.map((tag) => sql`${tag}`),
        sql`, `
      )})
      )`;
      const byTag = await db.query.books.findMany({
        columns: BOOK_CARD_COLUMNS,
        where: and(baseConditions, tagCondition),
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS }
        },
        orderBy: (books2, { desc: desc2 }) => [desc2(books2.releaseDate)],
        limit: limit + seenIds.size
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
    if (options.publisherId) {
      const byPublisher = await db.query.books.findMany({
        columns: BOOK_CARD_COLUMNS,
        where: and(baseConditions, eq(books.publisherId, options.publisherId)),
        with: {
          artist: { columns: CREATOR_CARD_COLUMNS },
          publisher: { columns: CREATOR_CARD_COLUMNS }
        },
        orderBy: (books2, { desc: desc2 }) => [desc2(books2.releaseDate)],
        limit: limit + seenIds.size
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
const getCreatorsByCreatorId = async (creatorId, creatorType, currentPage = 1, defaultLimit = 10) => {
  try {
    const relatedColumn = creatorType === "publisher" ? books.artistId : books.publisherId;
    const myColumn = creatorType === "publisher" ? books.publisherId : books.artistId;
    const peerColumnFilter = creatorType === "publisher" ? isNotNull(books.artistId) : isNotNull(books.publisherId);
    const publishedBooks = await db.selectDistinct({ relatedId: relatedColumn }).from(books).where(
      and(
        eq(myColumn, creatorId),
        peerColumnFilter,
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
      )
    );
    const relatedIds = publishedBooks.map((r) => r.relatedId).filter((id) => id != null);
    if (relatedIds.length === 0)
      return ok({ creators: [], totalPages: 1, page: 1 });
    const totalCount = relatedIds.length;
    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundCreators = await db.query.creators.findMany({
      columns: CREATOR_CARD_COLUMNS,
      where: inArray(creators.id, relatedIds),
      orderBy: (c, { asc: asc2 }) => [asc2(c.displayName)],
      limit,
      offset
    });
    return ok({ creators: foundCreators ?? [], totalPages, page });
  } catch (error) {
    console.error("Failed to get related creators", error);
    return err({ reason: "Failed to get related creators", error });
  }
};
const getRelatedCreators = async (creatorId, creatorType) => {
  try {
    const relatedColumn = creatorType === "publisher" ? books.artistId : books.publisherId;
    const joinColumn = creatorType === "publisher" ? books.artistId : books.publisherId;
    const myColumn = creatorType === "publisher" ? books.publisherId : books.artistId;
    const peerColumnFilter = creatorType === "publisher" ? isNotNull(books.artistId) : isNotNull(books.publisherId);
    const related = await db.selectDistinct(CREATOR_CARD_SELECT).from(creators).innerJoin(books, eq(joinColumn, creators.id)).where(
      and(
        eq(myColumn, creatorId),
        peerColumnFilter,
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
      )
    );
    if (related.length === 0) return ok({ creators: [] });
    return ok({ creators: related });
  } catch (error) {
    console.error("Failed to get related creators", error);
    return [];
  }
};
const getMessagesForFollower = async (followerUserId, currentPage = 1, limit = 20) => {
  try {
    const userFollows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, followerUserId),
        eq(follows.targetType, "creator")
      )
    });
    const followedCreatorIds = userFollows.map((f) => f.targetCreatorId).filter((id) => id != null);
    if (followedCreatorIds.length === 0) {
      return ok({ messages: [], totalPages: 0, page: 1 });
    }
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(creatorMessages).where(inArray(creatorMessages.creatorId, followedCreatorIds));
    const {
      page,
      limit: take,
      offset,
      totalPages
    } = getPagination(currentPage, totalCount, limit);
    const messages = await db.query.creatorMessages.findMany({
      where: inArray(creatorMessages.creatorId, followedCreatorIds),
      orderBy: [desc(creatorMessages.createdAt)],
      limit: take,
      offset,
      with: {
        creator: {
          columns: { id: true, displayName: true, slug: true, coverUrl: true }
        }
      }
    });
    return ok({ messages, totalPages, page });
  } catch (e) {
    console.error("Failed to get messages for follower", e);
    return err({ reason: "Failed to get messages for follower", error: e });
  }
};
const getHomepageStats = async () => {
  try {
    const now = /* @__PURE__ */ new Date();
    const [booksCountResult, artistsCountResult, publishersCountResult] = await Promise.all([
      db.select({ value: count() }).from(books).where(
        and(
          eq(books.publicationStatus, "published"),
          eq(books.approvalStatus, "approved"),
          or(isNull(books.releaseDate), lte(books.releaseDate, now))
        )
      ),
      db.select({ value: count() }).from(creators).where(eq(creators.type, "artist")),
      db.select({ value: count() }).from(creators).where(eq(creators.type, "publisher"))
    ]);
    return ok({
      books: booksCountResult[0]?.value ?? 0,
      artists: artistsCountResult[0]?.value ?? 0,
      publishers: publishersCountResult[0]?.value ?? 0
    });
  } catch (error) {
    console.error("Failed to get homepage stats", error);
    return err({ reason: "Failed to get homepage stats", error });
  }
};
const getFollowedCreatorsForBrowse = async (followerUserId, currentPage = 1, defaultLimit = 48) => {
  try {
    const followMatch = and(
      eq(follows.targetCreatorId, creators.id),
      eq(follows.followerUserId, followerUserId),
      eq(follows.targetType, "creator")
    );
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(creators).innerJoin(follows, followMatch).where(creatorsWithPublishedBooks);
    const { page, offset, totalPages, limit } = getPagination(
      currentPage,
      totalCount,
      defaultLimit
    );
    const foundCreators = await db.select(CREATOR_CARD_SELECT).from(creators).innerJoin(follows, followMatch).where(creatorsWithPublishedBooks).orderBy(asc(creators.displayName)).offset(offset).limit(limit);
    return ok({ creators: foundCreators, totalPages, page });
  } catch (error) {
    console.error("Failed to get followed creators for browse", error);
    return err({ reason: "Failed to get followed creators for browse", error });
  }
};
const getFollowedCreators = async (followerUserId) => {
  try {
    const followRows = await db.query.follows.findMany({
      where: and(
        eq(follows.followerUserId, followerUserId),
        eq(follows.targetType, "creator")
      ),
      columns: { targetCreatorId: true }
    });
    const followedCreatorIds = followRows.map((r) => r.targetCreatorId).filter((id) => id != null);
    const foundCreators = await db.query.creators.findMany({
      where: inArray(creators.id, followedCreatorIds),
      columns: CREATOR_CARD_COLUMNS
    });
    const artists = foundCreators.filter((c) => c.type === "artist");
    const publishers = foundCreators.filter((c) => c.type === "publisher");
    return ok({ artists, publishers });
  } catch (error) {
    console.error("Failed to get followed creators", error);
    return err({ reason: "Failed to get followed creators", error });
  }
};
async function getCoverUrlsForHeroCarousel(creatorType, creatorId, limit = 4) {
  const column = creatorType === "publisher" ? books.publisherId : books.artistId;
  try {
    const rows = await db.query.books.findMany({
      columns: { coverUrl: true },
      where: and(
        eq(column, creatorId),
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        isNotNull(books.coverUrl),
        or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
      ),
      orderBy: (b, { desc: d }) => [d(b.releaseDate), d(b.createdAt)],
      limit
    });
    const coverUrls = rows.map((r) => r.coverUrl).filter((url) => Boolean(url));
    return ok(coverUrls);
  } catch (e) {
    console.error("getCoverUrlsForPublisherCatalogue", e);
    return err({
      reason: "Failed to get cover urls for publisher catalogue",
      error: e
    });
  }
}
async function getCreatorSpotlightImageUrls(creatorType, creatorId, bookLimit = 12) {
  const column = creatorType === "publisher" ? books.publisherId : books.artistId;
  try {
    const rows = await db.query.books.findMany({
      columns: { coverUrl: true },
      where: and(
        eq(column, creatorId),
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
      ),
      orderBy: (b, { desc: d }) => [d(b.releaseDate), d(b.createdAt)],
      limit: bookLimit,
      with: {
        images: {
          columns: { imageUrl: true },
          orderBy: (bookImages, { asc: asc2 }) => [asc2(bookImages.sortOrder)]
        }
      }
    });
    const urls = /* @__PURE__ */ new Set();
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
      error: e
    });
  }
}
const getMessagesByCreatorSlug = async (creatorSlug, currentPage = 1, limit = 20) => {
  try {
    const creator = await db.query.creators.findFirst({
      where: eq(creators.slug, creatorSlug),
      columns: {
        id: true,
        slug: true,
        displayName: true,
        coverUrl: true,
        type: true
      }
    });
    if (!creator) return err({ reason: "Creator not found" });
    const [{ value: totalCount = 0 }] = await db.select({ value: count() }).from(creatorMessages).where(eq(creatorMessages.creatorId, creator.id));
    const { page, limit: limit2, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      5
    );
    const foundMessages = await db.query.creatorMessages.findMany({
      where: eq(creatorMessages.creatorId, creator.id),
      orderBy: [desc(creatorMessages.createdAt)],
      limit: limit2,
      offset,
      with: {
        creator: {
          columns: { id: true, slug: true, displayName: true, coverUrl: true }
        }
      }
    });
    return ok({ messages: foundMessages ?? [], totalPages, page, creator });
  } catch (error) {
    console.error("Failed to get messages by creator slug", error);
    return err({ reason: "Failed to get messages by creator slug", error });
  }
};
const getPublishedInterviews = async () => {
  try {
    const interviews = await db.query.creatorInterviews.findMany({
      columns: {
        id: true,
        creatorId: true,
        status: true,
        completedAt: true,
        promoImageUrl: true,
        answers: true
      },
      orderBy: [desc(creatorInterviews.completedAt)],
      where: and(
        eq(creatorInterviews.status, "published"),
        isNotNull(creatorInterviews.promoImageUrl)
      ),
      with: {
        creator: {
          columns: { id: true, displayName: true, slug: true, coverUrl: true }
        }
      }
    });
    return ok(interviews);
  } catch (error) {
    console.error("Failed to get interviews", error);
    return err({ reason: "Failed to get interviews", error });
  }
};
const getInterviewByCreatorSlug = async (slug) => {
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
            type: true
          },
          with: {
            booksAsArtist: {
              columns: { id: true, title: true, slug: true, coverUrl: true },
              where: and(
                eq(books.publicationStatus, "published"),
                eq(books.approvalStatus, "approved")
              ),
              orderBy: (b, { desc: desc2 }) => [
                desc2(b.releaseDate),
                desc2(b.createdAt)
              ],
              limit: 1,
              with: {
                images: {
                  columns: { id: true, imageUrl: true },
                  orderBy: (bookImages, { asc: asc2 }) => [asc2(bookImages.sortOrder)]
                }
              }
            },
            booksAsPublisher: {
              columns: { id: true, title: true, slug: true, coverUrl: true },
              where: and(
                eq(books.publicationStatus, "published"),
                eq(books.approvalStatus, "approved")
              ),
              orderBy: (b, { desc: desc2 }) => [
                desc2(b.releaseDate),
                desc2(b.createdAt)
              ],
              limit: 1,
              with: {
                images: {
                  columns: { id: true, imageUrl: true },
                  orderBy: (bookImages, { asc: asc2 }) => [asc2(bookImages.sortOrder)]
                }
              }
            }
          }
        }
      }
    });
    return ok(interview);
  } catch (error) {
    console.error("Failed to get interview by creator slug", error);
    return err({ reason: "Failed to get interview by creator slug", error });
  }
};
const getInterviewById = async (interviewId) => {
  try {
    const interview = await db.query.creatorInterviews.findFirst({
      where: eq(creatorInterviews.id, interviewId),
      with: {
        creator: {
          columns: CREATOR_CARD_COLUMNS
        }
      }
    });
    return ok(interview);
  } catch (error) {
    console.error("Failed to get interview by creator slug", error);
    return err({ reason: "Failed to get interview by creator slug", error });
  }
};
export {
  deleteCommentById,
  filterPublishedBooks,
  filterPublishedCreators,
  getAllCreatorsByType,
  getAllCreatorsForBrowse,
  getBookAboutBySlug,
  getBookBySlug,
  getBookComments,
  getBookCommentsBySlug,
  getBookPublisherBySlug,
  getBooksByCreatorSlug,
  getBooksByTag,
  getBooksInCollection,
  getBooksInWishlist,
  getCommentById,
  getCoverUrlsForHeroCarousel,
  getCreatorAboutBySlug,
  getCreatorAndAssociatedCreatorsByCreatorSlugMobile,
  getCreatorSpotlightImageUrls,
  getCreatorsByCreatorId,
  getDisplayName,
  getFeedBooks,
  getFilteredBooks,
  getFirstBookByTag,
  getFollowedCreators,
  getFollowedCreatorsForBrowse,
  getHomepageStats,
  getInterviewByCreatorSlug,
  getInterviewById,
  getLatestBooks,
  getMessagesByCreatorSlug,
  getMessagesForFollower,
  getPublishedInterviews,
  getRecentlyVerifiedCreators,
  getRelatedBooks,
  getRelatedCreators,
  getVerifiedCreators,
  invalidateBookCache,
  invalidateCreatorCache,
  loadFeaturedBookGroupCovers,
  searchCreators,
  updateCommentById
};
