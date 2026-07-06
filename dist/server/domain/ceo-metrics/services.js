import {
  and,
  count,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  or,
  sql
} from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  artistOfTheWeek,
  bookOfTheDay,
  books,
  collectionItems,
  follows,
  publisherOfTheWeek,
  purchaseClicks,
  bookViews,
  wishlists
} from "../../db/schema.js";
import {
  presetAnalyticsDateRange
} from "../../features/book-analytics/dateRange.js";
import { err, ok } from "../../lib/result.js";
import { EDITORIAL_REFERER_PATHS } from "./editorial.js";
import { formatPeriodDelta, previousPeriodRange } from "./format.js";
const CEO_METRICS_DEFAULT_DAYS = 7;
function dayAfter(date) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}
function rangeEndExclusive(range) {
  return dayAfter(range.to);
}
const discoverableBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date())),
  isNotNull(books.coverUrl),
  sql`trim(${books.purchaseLink}) ~* '^https?://'`
);
function createdInRange(column, range) {
  return and(
    gte(column, range.from),
    lt(column, rangeEndExclusive(range))
  );
}
function editorialRefererFilter(column) {
  const patterns = EDITORIAL_REFERER_PATHS.map(
    (path) => sql`${column} ILIKE ${`%${path}%`}`
  );
  return or(...patterns);
}
async function countWeeklyActiveCollectors(range) {
  const rangeFilter = (column) => createdInRange(column, range);
  const [viewRows, wishlistRows, followRows, clickRows, collectionRows] = await Promise.all([
    db.selectDistinct({ userId: bookViews.userId }).from(bookViews).where(
      and(isNotNull(bookViews.userId), rangeFilter(bookViews.createdAt))
    ),
    db.selectDistinct({ userId: wishlists.userId }).from(wishlists).where(rangeFilter(wishlists.createdAt)),
    db.selectDistinct({ userId: follows.followerUserId }).from(follows).where(rangeFilter(follows.createdAt)),
    db.selectDistinct({ userId: purchaseClicks.userId }).from(purchaseClicks).where(
      and(
        isNotNull(purchaseClicks.userId),
        rangeFilter(purchaseClicks.createdAt)
      )
    ),
    db.selectDistinct({ userId: collectionItems.userId }).from(collectionItems).where(rangeFilter(collectionItems.createdAt))
  ]);
  const activeUserIds = /* @__PURE__ */ new Set();
  for (const row of [
    ...viewRows,
    ...wishlistRows,
    ...followRows,
    ...clickRows,
    ...collectionRows
  ]) {
    if (row.userId) activeUserIds.add(row.userId);
  }
  return activeUserIds.size;
}
async function countEditorialViews(range) {
  const filter = and(
    createdInRange(bookViews.createdAt, range),
    editorialRefererFilter(bookViews.referer)
  );
  const [row] = await db.select({ value: count() }).from(bookViews).where(filter);
  return row?.value ?? 0;
}
async function countEditorialClicks(range) {
  const filter = and(
    createdInRange(purchaseClicks.createdAt, range),
    editorialRefererFilter(purchaseClicks.referer)
  );
  const [row] = await db.select({ value: count() }).from(purchaseClicks).where(filter);
  return row?.value ?? 0;
}
async function countFeaturedWishlists(range) {
  const end = rangeEndExclusive(range);
  const [row] = await db.select({ value: count() }).from(wishlists).innerJoin(
    bookOfTheDay,
    and(
      eq(wishlists.bookId, bookOfTheDay.bookId),
      gte(bookOfTheDay.date, range.from),
      lt(bookOfTheDay.date, end)
    )
  ).where(
    and(
      gte(wishlists.createdAt, range.from),
      lt(wishlists.createdAt, end)
    )
  );
  return row?.value ?? 0;
}
async function countFeaturedFollows(range) {
  const end = rangeEndExclusive(range);
  const [artistRows, publisherRows] = await Promise.all([
    db.select({ creatorId: artistOfTheWeek.creatorId }).from(artistOfTheWeek).where(
      and(
        gte(artistOfTheWeek.weekStart, range.from),
        lt(artistOfTheWeek.weekStart, end)
      )
    ),
    db.select({ creatorId: publisherOfTheWeek.creatorId }).from(publisherOfTheWeek).where(
      and(
        gte(publisherOfTheWeek.weekStart, range.from),
        lt(publisherOfTheWeek.weekStart, end)
      )
    )
  ]);
  const creatorIds = [
    ...new Set(
      [...artistRows, ...publisherRows].map((row2) => row2.creatorId)
    )
  ];
  if (creatorIds.length === 0) return 0;
  const [row] = await db.select({ value: count() }).from(follows).where(
    and(
      inArray(follows.targetCreatorId, creatorIds),
      eq(follows.targetType, "creator"),
      gte(follows.createdAt, range.from),
      lt(follows.createdAt, end)
    )
  );
  return row?.value ?? 0;
}
async function getEditorialBreakdown(range) {
  const [views, clicks, featuredWishlists, featuredFollows] = await Promise.all([
    countEditorialViews(range),
    countEditorialClicks(range),
    countFeaturedWishlists(range),
    countFeaturedFollows(range)
  ]);
  return { views, clicks, featuredWishlists, featuredFollows };
}
function sumEditorialActions(breakdown) {
  return breakdown.views + breakdown.clicks + breakdown.featuredWishlists + breakdown.featuredFollows;
}
async function countDiscoverableBooks() {
  const [row] = await db.select({ value: count() }).from(books).where(discoverableBookConditions);
  return row?.value ?? 0;
}
async function countActiveCreators() {
  const [artistRows, publisherRows] = await Promise.all([
    db.selectDistinct({ creatorId: books.artistId }).from(books).where(and(discoverableBookConditions, isNotNull(books.artistId))),
    db.selectDistinct({ creatorId: books.publisherId }).from(books).where(and(discoverableBookConditions, isNotNull(books.publisherId)))
  ]);
  const creatorIds = /* @__PURE__ */ new Set();
  for (const row of [...artistRows, ...publisherRows]) {
    if (row.creatorId) creatorIds.add(row.creatorId);
  }
  return creatorIds.size;
}
async function countNewDiscoverableReleases(range) {
  const end = rangeEndExclusive(range);
  const releaseInRange = or(
    and(
      isNotNull(books.releaseDate),
      gte(books.releaseDate, range.from),
      lt(books.releaseDate, end)
    ),
    and(
      isNull(books.releaseDate),
      gte(books.createdAt, range.from),
      lt(books.createdAt, end)
    )
  );
  const [row] = await db.select({ value: count() }).from(books).where(and(discoverableBookConditions, releaseInRange));
  return row?.value ?? 0;
}
function withDelta(current, previous) {
  return {
    value: current,
    delta: formatPeriodDelta(current, previous)
  };
}
function resolveCeoMetricsRange(dateRange) {
  return dateRange ?? presetAnalyticsDateRange(CEO_METRICS_DEFAULT_DAYS);
}
async function getSupplyHealthMetrics(range) {
  const previousRange = previousPeriodRange(range);
  const [discoverableBooks, activeCreators, newReleases, priorNewReleases] = await Promise.all([
    countDiscoverableBooks(),
    countActiveCreators(),
    countNewDiscoverableReleases(range),
    countNewDiscoverableReleases(previousRange)
  ]);
  return {
    discoverableBooks,
    activeCreators,
    newReleases: withDelta(newReleases, priorNewReleases)
  };
}
async function getCeoMetricsSnapshot(dateRange) {
  const range = resolveCeoMetricsRange(dateRange);
  const previousRange = previousPeriodRange(range);
  try {
    const [
      activeCurrent,
      activePrevious,
      editorialCurrent,
      editorialPrevious,
      supplyHealth
    ] = await Promise.all([
      countWeeklyActiveCollectors(range),
      countWeeklyActiveCollectors(previousRange),
      getEditorialBreakdown(range),
      getEditorialBreakdown(previousRange),
      getSupplyHealthMetrics(range)
    ]);
    const editorialCurrentTotal = sumEditorialActions(editorialCurrent);
    const editorialPreviousTotal = sumEditorialActions(editorialPrevious);
    return ok({
      range,
      previousRange,
      weeklyActiveCollectors: withDelta(activeCurrent, activePrevious),
      editorialActions: {
        value: editorialCurrentTotal,
        delta: formatPeriodDelta(editorialCurrentTotal, editorialPreviousTotal),
        breakdown: editorialCurrent
      },
      supplyHealth
    });
  } catch (error) {
    console.error("Failed to load CEO metrics", error);
    return err({ reason: "Failed to load CEO metrics", cause: error });
  }
}
export {
  CEO_METRICS_DEFAULT_DAYS,
  discoverableBookConditions,
  getCeoMetricsSnapshot,
  getSupplyHealthMetrics,
  resolveCeoMetricsRange
};
