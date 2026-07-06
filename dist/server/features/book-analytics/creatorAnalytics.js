import { and, count, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  bookViews,
  books,
  collectionItems,
  purchaseClicks,
  wishlists
} from "../../db/schema.js";
import { buildCreatedAtFilter } from "./dateRange.js";
import {
  getFollowTotal,
  mergeDailyFunnelTrends,
  mergeDailySourceTrends
} from "./trends.js";
import { withClickRate } from "./funnel.js";
function creatorRoleBookColumn(creatorType) {
  return creatorType === "publisher" ? books.publisherId : books.artistId;
}
function creatorBookFilter(creatorId, creatorType) {
  return eq(creatorRoleBookColumn(creatorType), creatorId);
}
async function getCreatorBookViewTotals({ creatorId, creatorType }, range) {
  const creatorFilter = creatorBookFilter(creatorId, creatorType);
  const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const where = dateFilter ? and(creatorFilter, dateFilter) : creatorFilter;
  const [totalViewsResult, booksWithViewsResult] = await Promise.all([
    db.select({ value: count() }).from(bookViews).innerJoin(books, eq(bookViews.bookId, books.id)).where(where),
    db.select({
      value: sql`count(distinct ${bookViews.bookId})`
    }).from(bookViews).innerJoin(books, eq(bookViews.bookId, books.id)).where(where)
  ]);
  return {
    totalViews: totalViewsResult[0]?.value ?? 0,
    booksWithViews: booksWithViewsResult[0]?.value ?? 0
  };
}
async function getCreatorPurchaseClickTotals({ creatorId, creatorType }, range) {
  const creatorFilter = creatorBookFilter(creatorId, creatorType);
  const dateFilter = buildCreatedAtFilter(purchaseClicks.createdAt, range);
  const where = dateFilter ? and(creatorFilter, dateFilter) : creatorFilter;
  const [totalClicksResult, booksWithClicksResult] = await Promise.all([
    db.select({ value: count() }).from(purchaseClicks).innerJoin(books, eq(purchaseClicks.bookId, books.id)).where(where),
    db.select({
      value: sql`count(distinct ${purchaseClicks.bookId})`
    }).from(purchaseClicks).innerJoin(books, eq(purchaseClicks.bookId, books.id)).where(where)
  ]);
  return {
    totalClicks: totalClicksResult[0]?.value ?? 0,
    booksWithClicks: booksWithClicksResult[0]?.value ?? 0
  };
}
async function getCreatorFunnelTotals(scope, range) {
  const { creatorId, creatorType } = scope;
  const creatorFilter = creatorBookFilter(creatorId, creatorType);
  const favoritesFilter = buildCreatedAtFilter(wishlists.createdAt, range);
  const favoritesWhere = favoritesFilter ? and(creatorFilter, favoritesFilter) : creatorFilter;
  const [viewTotals, clickTotals, favoriteTotal, followTotal] = await Promise.all([
    getCreatorBookViewTotals(scope, range),
    getCreatorPurchaseClickTotals(scope, range),
    db.select({ value: count() }).from(wishlists).innerJoin(books, eq(wishlists.bookId, books.id)).where(favoritesWhere),
    getFollowTotal(range)
  ]);
  return {
    ...withClickRate({
      views: viewTotals.totalViews,
      favorites: favoriteTotal[0]?.value ?? 0,
      outboundClicks: clickTotals.totalClicks
    }),
    booksWithViews: viewTotals.booksWithViews,
    booksWithClicks: clickTotals.booksWithClicks,
    follows: followTotal
  };
}
async function getCreatorDailyCounts(scope, table, createdAtColumn, range) {
  const dateFilter = buildCreatedAtFilter(createdAtColumn, range);
  if (!dateFilter) return [];
  const creatorFilter = creatorBookFilter(scope.creatorId, scope.creatorType);
  const rows = await db.select({
    day: sql`date_trunc('day', ${createdAtColumn})::date`,
    value: count()
  }).from(table).innerJoin(books, eq(table.bookId, books.id)).where(and(creatorFilter, dateFilter)).groupBy(sql`date_trunc('day', ${createdAtColumn})::date`).orderBy(sql`date_trunc('day', ${createdAtColumn})::date`);
  return rows;
}
async function getCreatorDailySourceCounts(scope, table, createdAtColumn, sourceColumn, range) {
  const dateFilter = buildCreatedAtFilter(createdAtColumn, range);
  if (!dateFilter) return [];
  const creatorFilter = creatorBookFilter(scope.creatorId, scope.creatorType);
  const rows = await db.select({
    day: sql`date_trunc('day', ${createdAtColumn})::date`,
    source: sourceColumn,
    value: count()
  }).from(table).innerJoin(books, eq(table.bookId, books.id)).where(and(creatorFilter, dateFilter)).groupBy(sql`date_trunc('day', ${createdAtColumn})::date`, sourceColumn).orderBy(sql`date_trunc('day', ${createdAtColumn})::date`);
  return rows.map((row) => ({
    day: row.day,
    source: row.source,
    value: row.value
  }));
}
async function getCreatorDailyFunnelTrends(scope, range) {
  const [views, clicks, wishlistRows, collectionRows] = await Promise.all([
    getCreatorDailyCounts(scope, bookViews, bookViews.createdAt, range),
    getCreatorDailyCounts(
      scope,
      purchaseClicks,
      purchaseClicks.createdAt,
      range
    ),
    getCreatorDailyCounts(scope, wishlists, wishlists.createdAt, range),
    getCreatorDailyCounts(
      scope,
      collectionItems,
      collectionItems.createdAt,
      range
    )
  ]);
  return mergeDailyFunnelTrends(
    range,
    views,
    clicks,
    wishlistRows,
    collectionRows,
    []
  );
}
async function getCreatorDailySourceTrends(scope, range) {
  const [viewRows, clickRows] = await Promise.all([
    getCreatorDailySourceCounts(
      scope,
      bookViews,
      bookViews.createdAt,
      bookViews.source,
      range
    ),
    getCreatorDailySourceCounts(
      scope,
      purchaseClicks,
      purchaseClicks.createdAt,
      purchaseClicks.source,
      range
    )
  ]);
  return mergeDailySourceTrends(range, viewRows, clickRows);
}
async function getCreatorSourceTotals(scope, range) {
  const creatorFilter = creatorBookFilter(scope.creatorId, scope.creatorType);
  const viewFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const clickFilter = buildCreatedAtFilter(purchaseClicks.createdAt, range);
  const viewWhere = viewFilter ? and(creatorFilter, viewFilter) : creatorFilter;
  const clickWhere = clickFilter ? and(creatorFilter, clickFilter) : creatorFilter;
  const [viewRows, clickRows] = await Promise.all([
    db.select({
      source: bookViews.source,
      value: count()
    }).from(bookViews).innerJoin(books, eq(bookViews.bookId, books.id)).where(viewWhere).groupBy(bookViews.source),
    db.select({
      source: purchaseClicks.source,
      value: count()
    }).from(purchaseClicks).innerJoin(books, eq(purchaseClicks.bookId, books.id)).where(clickWhere).groupBy(purchaseClicks.source)
  ]);
  const totals = {
    views: { web: 0, hyperview: 0 },
    clicks: { web: 0, hyperview: 0 }
  };
  for (const row of viewRows) totals.views[row.source] = row.value;
  for (const row of clickRows) totals.clicks[row.source] = row.value;
  return totals;
}
export {
  creatorRoleBookColumn,
  getCreatorBookViewTotals,
  getCreatorDailyFunnelTrends,
  getCreatorDailySourceTrends,
  getCreatorFunnelTotals,
  getCreatorPurchaseClickTotals,
  getCreatorSourceTotals
};
