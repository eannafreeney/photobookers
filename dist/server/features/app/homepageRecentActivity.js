import { LRUCache } from "lru-cache";
import { and, desc, eq, gte, isNotNull, isNull, lte, or } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  bookComments,
  books,
  collectionItems,
  creators,
  follows,
  users,
  wishlists
} from "../../db/schema.js";
import { resolveStoragePublicImageUrl } from "../../lib/imageUrl.js";
import { err, ok } from "../../lib/result.js";
import {
  formatActivityActorName,
  mergeRecentActivityItems
} from "./homepageRecentActivityUtils.js";
import {
  mergeRecentActivityItems as mergeRecentActivityItems2,
  recentActivityVerb
} from "./homepageRecentActivityUtils.js";
const CACHE_TTL_MS = 1e3 * 60 * 3;
const RECENT_ACTIVITY_DAYS = 14;
const FETCH_PER_SOURCE = 12;
const RECENT_ACTIVITY_PAGE_SIZE = 10;
const MAX_MERGED_ITEMS = FETCH_PER_SOURCE * 4;
const cache = new LRUCache({
  max: 1,
  ttl: CACHE_TTL_MS
});
const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
);
function recentSince() {
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - RECENT_ACTIVITY_DAYS);
  return since;
}
function clearHomepageRecentActivityCacheForTests() {
  cache.clear();
}
async function fetchRecentWishlistActivity(since) {
  const rows = await db.select({
    id: wishlists.bookId,
    createdAt: wishlists.createdAt,
    bookTitle: books.title,
    bookSlug: books.slug,
    coverUrl: books.coverUrl,
    artistName: creators.displayName,
    userId: wishlists.userId,
    actorFirstName: users.firstName,
    actorLastName: users.lastName,
    actorImageUrl: users.profileImageUrl
  }).from(wishlists).innerJoin(books, eq(wishlists.bookId, books.id)).innerJoin(users, eq(wishlists.userId, users.id)).leftJoin(creators, eq(books.artistId, creators.id)).where(
    and(
      publishedBookConditions,
      isNotNull(books.coverUrl),
      gte(wishlists.createdAt, since)
    )
  ).orderBy(desc(wishlists.createdAt)).limit(FETCH_PER_SOURCE);
  return rows.filter((row) => row.createdAt).map((row) => ({
    id: `wishlist-${row.userId}-${row.id}-${row.createdAt.getTime()}`,
    type: "book_favourited",
    actorName: formatActivityActorName({
      firstName: row.actorFirstName,
      lastName: row.actorLastName
    }),
    actorImageUrl: row.actorImageUrl,
    targetName: row.bookTitle,
    targetUrl: `/books/${row.bookSlug}`,
    imageUrl: row.coverUrl,
    targetCreatorName: row.artistName ?? void 0,
    createdAt: row.createdAt
  }));
}
async function fetchRecentCollectionActivity(since) {
  const rows = await db.select({
    id: collectionItems.id,
    createdAt: collectionItems.createdAt,
    bookTitle: books.title,
    bookSlug: books.slug,
    coverUrl: books.coverUrl,
    artistName: creators.displayName,
    actorFirstName: users.firstName,
    actorLastName: users.lastName,
    actorImageUrl: users.profileImageUrl
  }).from(collectionItems).innerJoin(books, eq(collectionItems.bookId, books.id)).innerJoin(users, eq(collectionItems.userId, users.id)).leftJoin(creators, eq(books.artistId, creators.id)).where(
    and(
      publishedBookConditions,
      isNotNull(books.coverUrl),
      gte(collectionItems.createdAt, since)
    )
  ).orderBy(desc(collectionItems.createdAt)).limit(FETCH_PER_SOURCE);
  return rows.filter((row) => row.createdAt).map((row) => ({
    id: `collection-${row.id}`,
    type: "book_collected",
    actorName: formatActivityActorName({
      firstName: row.actorFirstName,
      lastName: row.actorLastName
    }),
    actorImageUrl: row.actorImageUrl,
    targetName: row.bookTitle,
    targetUrl: `/books/${row.bookSlug}`,
    imageUrl: row.coverUrl,
    targetCreatorName: row.artistName ?? void 0,
    createdAt: row.createdAt
  }));
}
async function fetchRecentCommentActivity(since) {
  const rows = await db.select({
    id: bookComments.id,
    createdAt: bookComments.createdAt,
    bookTitle: books.title,
    bookSlug: books.slug,
    coverUrl: books.coverUrl,
    artistName: creators.displayName,
    actorFirstName: users.firstName,
    actorLastName: users.lastName,
    actorImageUrl: users.profileImageUrl
  }).from(bookComments).innerJoin(books, eq(bookComments.bookId, books.id)).innerJoin(users, eq(bookComments.userId, users.id)).leftJoin(creators, eq(books.artistId, creators.id)).where(
    and(
      publishedBookConditions,
      isNotNull(books.coverUrl),
      gte(bookComments.createdAt, since)
    )
  ).orderBy(desc(bookComments.createdAt)).limit(FETCH_PER_SOURCE);
  return rows.filter((row) => row.createdAt).map((row) => ({
    id: `comment-${row.id}`,
    type: "book_commented",
    actorName: formatActivityActorName({
      firstName: row.actorFirstName,
      lastName: row.actorLastName
    }),
    actorImageUrl: row.actorImageUrl,
    targetName: row.bookTitle,
    targetUrl: `/books/${row.bookSlug}`,
    imageUrl: row.coverUrl,
    targetCreatorName: row.artistName ?? void 0,
    createdAt: row.createdAt
  }));
}
async function fetchRecentFollowActivity(since) {
  const rows = await db.select({
    id: follows.id,
    createdAt: follows.createdAt,
    creatorName: creators.displayName,
    creatorSlug: creators.slug,
    coverUrl: creators.coverUrl,
    actorFirstName: users.firstName,
    actorLastName: users.lastName,
    actorImageUrl: users.profileImageUrl
  }).from(follows).innerJoin(creators, eq(follows.targetCreatorId, creators.id)).innerJoin(users, eq(follows.followerUserId, users.id)).where(
    and(
      eq(follows.targetType, "creator"),
      isNotNull(creators.coverUrl),
      gte(follows.createdAt, since)
    )
  ).orderBy(desc(follows.createdAt)).limit(FETCH_PER_SOURCE);
  return rows.filter((row) => row.createdAt).map((row) => ({
    id: `follow-${row.id}`,
    type: "creator_followed",
    actorName: formatActivityActorName({
      firstName: row.actorFirstName,
      lastName: row.actorLastName
    }),
    actorImageUrl: row.actorImageUrl,
    targetName: row.creatorName,
    targetUrl: `/creators/${row.creatorSlug}`,
    imageUrl: row.coverUrl,
    createdAt: row.createdAt
  }));
}
async function getMergedRecentActivity() {
  const cacheKey = "merged-all";
  const cached = cache.get(cacheKey);
  if (cached) return ok(cached);
  try {
    const since = recentSince();
    const [wishlistsRows, collectionsRows, commentsRows, followsRows] = await Promise.all([
      fetchRecentWishlistActivity(since),
      fetchRecentCollectionActivity(since),
      fetchRecentCommentActivity(since),
      fetchRecentFollowActivity(since)
    ]);
    const items = mergeRecentActivityItems(
      [
        ...wishlistsRows,
        ...collectionsRows,
        ...commentsRows,
        ...followsRows
      ],
      MAX_MERGED_ITEMS,
      resolveStoragePublicImageUrl
    );
    cache.set(cacheKey, items);
    return ok(items);
  } catch (error) {
    console.error("Failed to get recent public activity", error);
    return err({ reason: "Failed to get recent public activity", error });
  }
}
async function getRecentPublicActivityPage(offset = 0, limit = RECENT_ACTIVITY_PAGE_SIZE) {
  const [error, all] = await getMergedRecentActivity();
  if (error || !all) return error ? err(error) : err({ reason: "No activity" });
  const items = all.slice(offset, offset + limit);
  const nextOffset = offset + items.length;
  return ok({
    items,
    hasMore: nextOffset < all.length,
    nextOffset,
    pageSize: limit
  });
}
async function getRecentPublicActivity(limit = RECENT_ACTIVITY_PAGE_SIZE) {
  const [error, page] = await getRecentPublicActivityPage(0, limit);
  if (error || !page) return error ? err(error) : err({ reason: "No activity" });
  return ok(page.items);
}
export {
  RECENT_ACTIVITY_PAGE_SIZE,
  clearHomepageRecentActivityCacheForTests,
  getRecentPublicActivity,
  getRecentPublicActivityPage,
  mergeRecentActivityItems2 as mergeRecentActivityItems,
  recentActivityVerb
};
