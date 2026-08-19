import { LRUCache } from "lru-cache";
import { and, desc, eq, gte, isNotNull, isNull, lte, or } from "drizzle-orm";
import { db } from "../../db/client";
import {
  bookComments,
  books,
  collectionItems,
  creators,
  follows,
  wishlists,
} from "../../db/schema";
import { resolveStoragePublicImageUrl } from "../../lib/imageUrl";
import { err, ok, type Result } from "../../lib/result";
import {
  mergeRecentActivityItems,
  type RecentActivityItem,
} from "./homepageRecentActivityUtils";

export type {
  RecentActivityItem,
  RecentActivityType,
} from "./homepageRecentActivityUtils";
export {
  mergeRecentActivityItems,
  recentActivityTrailingText,
} from "./homepageRecentActivityUtils";

const CACHE_TTL_MS = 1000 * 60 * 3;
const RECENT_ACTIVITY_DAYS = 14;
const FETCH_PER_SOURCE = 12;
const DEFAULT_LIMIT = 10;

const cache = new LRUCache<string, RecentActivityItem[]>({
  max: 1,
  ttl: CACHE_TTL_MS,
});

const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
);

function recentSince(): Date {
  const since = new Date();
  since.setDate(since.getDate() - RECENT_ACTIVITY_DAYS);
  return since;
}

type RawActivityRow = Omit<RecentActivityItem, "imageUrl"> & {
  imageUrl: string | null;
};

export function clearHomepageRecentActivityCacheForTests(): void {
  cache.clear();
}

async function fetchRecentWishlistActivity(
  since: Date,
): Promise<RawActivityRow[]> {
  const rows = await db
    .select({
      id: wishlists.bookId,
      createdAt: wishlists.createdAt,
      bookTitle: books.title,
      bookSlug: books.slug,
      coverUrl: books.coverUrl,
      artistName: creators.displayName,
      userId: wishlists.userId,
    })
    .from(wishlists)
    .innerJoin(books, eq(wishlists.bookId, books.id))
    .leftJoin(creators, eq(books.artistId, creators.id))
    .where(
      and(
        publishedBookConditions,
        isNotNull(books.coverUrl),
        gte(wishlists.createdAt, since),
      ),
    )
    .orderBy(desc(wishlists.createdAt))
    .limit(FETCH_PER_SOURCE);

  return rows
    .filter((row) => row.createdAt)
    .map((row) => ({
      id: `wishlist-${row.userId}-${row.id}-${row.createdAt!.getTime()}`,
      type: "book_favourited" as const,
      targetName: row.bookTitle,
      targetUrl: `/books/${row.bookSlug}`,
      imageUrl: row.coverUrl,
      targetCreatorName: row.artistName ?? undefined,
      createdAt: row.createdAt!,
    }));
}

async function fetchRecentCollectionActivity(
  since: Date,
): Promise<RawActivityRow[]> {
  const rows = await db
    .select({
      id: collectionItems.id,
      createdAt: collectionItems.createdAt,
      bookTitle: books.title,
      bookSlug: books.slug,
      coverUrl: books.coverUrl,
      artistName: creators.displayName,
    })
    .from(collectionItems)
    .innerJoin(books, eq(collectionItems.bookId, books.id))
    .leftJoin(creators, eq(books.artistId, creators.id))
    .where(
      and(
        publishedBookConditions,
        isNotNull(books.coverUrl),
        gte(collectionItems.createdAt, since),
      ),
    )
    .orderBy(desc(collectionItems.createdAt))
    .limit(FETCH_PER_SOURCE);

  return rows
    .filter((row) => row.createdAt)
    .map((row) => ({
      id: `collection-${row.id}`,
      type: "book_collected" as const,
      targetName: row.bookTitle,
      targetUrl: `/books/${row.bookSlug}`,
      imageUrl: row.coverUrl,
      targetCreatorName: row.artistName ?? undefined,
      createdAt: row.createdAt!,
    }));
}

async function fetchRecentCommentActivity(
  since: Date,
): Promise<RawActivityRow[]> {
  const rows = await db
    .select({
      id: bookComments.id,
      createdAt: bookComments.createdAt,
      bookTitle: books.title,
      bookSlug: books.slug,
      coverUrl: books.coverUrl,
      artistName: creators.displayName,
    })
    .from(bookComments)
    .innerJoin(books, eq(bookComments.bookId, books.id))
    .leftJoin(creators, eq(books.artistId, creators.id))
    .where(
      and(
        publishedBookConditions,
        isNotNull(books.coverUrl),
        gte(bookComments.createdAt, since),
      ),
    )
    .orderBy(desc(bookComments.createdAt))
    .limit(FETCH_PER_SOURCE);

  return rows
    .filter((row) => row.createdAt)
    .map((row) => ({
      id: `comment-${row.id}`,
      type: "book_commented" as const,
      targetName: row.bookTitle,
      targetUrl: `/books/${row.bookSlug}`,
      imageUrl: row.coverUrl,
      targetCreatorName: row.artistName ?? undefined,
      createdAt: row.createdAt!,
    }));
}

async function fetchRecentFollowActivity(
  since: Date,
): Promise<RawActivityRow[]> {
  const rows = await db
    .select({
      id: follows.id,
      createdAt: follows.createdAt,
      creatorName: creators.displayName,
      creatorSlug: creators.slug,
      coverUrl: creators.coverUrl,
    })
    .from(follows)
    .innerJoin(creators, eq(follows.targetCreatorId, creators.id))
    .where(
      and(
        eq(follows.targetType, "creator"),
        isNotNull(creators.coverUrl),
        gte(follows.createdAt, since),
      ),
    )
    .orderBy(desc(follows.createdAt))
    .limit(FETCH_PER_SOURCE);

  return rows
    .filter((row) => row.createdAt)
    .map((row) => ({
      id: `follow-${row.id}`,
      type: "creator_followed" as const,
      targetName: row.creatorName,
      targetUrl: `/creators/${row.creatorSlug}`,
      imageUrl: row.coverUrl,
      createdAt: row.createdAt!,
    }));
}

export async function getRecentPublicActivity(
  limit = DEFAULT_LIMIT,
): Promise<Result<RecentActivityItem[], { reason: string }>> {
  const cacheKey = `default-${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return ok(cached);

  try {
    const since = recentSince();
    const [wishlistsRows, collectionsRows, commentsRows, followsRows] =
      await Promise.all([
        fetchRecentWishlistActivity(since),
        fetchRecentCollectionActivity(since),
        fetchRecentCommentActivity(since),
        fetchRecentFollowActivity(since),
      ]);

    const items = mergeRecentActivityItems(
      [
        ...wishlistsRows,
        ...collectionsRows,
        ...commentsRows,
        ...followsRows,
      ],
      limit,
      resolveStoragePublicImageUrl,
    );

    cache.set(cacheKey, items);
    return ok(items);
  } catch (error) {
    console.error("Failed to get recent public activity", error);
    return err({ reason: "Failed to get recent public activity", error });
  }
}
