import { and, count, eq, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/client";
import {
  bookViews,
  books,
  collectionItems,
  purchaseClicks,
  wishlists,
  type CreatorType,
} from "../../db/schema";
import { buildCreatedAtFilter, type AnalyticsDateRange } from "./dateRange";
import {
  mergeDailyFunnelTrends,
  mergeDailySourceTrends,
  type DailySourceTrendPoint,
  type DailyTrendPoint,
  type SourceTotals,
} from "./trends";
import { withClickRate, type CatalogueFunnelTotals } from "./funnel";

export type CreatorAnalyticsScope = {
  creatorId: string;
  creatorType: CreatorType;
};

export type CreatorOverviewTotals = CatalogueFunnelTotals & {
  booksWithViews: number;
  booksWithClicks: number;
};

export function creatorRoleBookColumn(creatorType: CreatorType) {
  return creatorType === "publisher" ? books.publisherId : books.artistId;
}

function creatorBookFilter(creatorId: string, creatorType: CreatorType): SQL {
  return eq(creatorRoleBookColumn(creatorType), creatorId);
}

export async function getCreatorBookViewTotals(
  { creatorId, creatorType }: CreatorAnalyticsScope,
  range?: AnalyticsDateRange | null,
) {
  const creatorFilter = creatorBookFilter(creatorId, creatorType);
  const dateFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const where = dateFilter ? and(creatorFilter, dateFilter) : creatorFilter;

  const [totalViewsResult, booksWithViewsResult] = await Promise.all([
    db
      .select({ value: count() })
      .from(bookViews)
      .innerJoin(books, eq(bookViews.bookId, books.id))
      .where(where),
    db
      .select({
        value: sql<number>`count(distinct ${bookViews.bookId})`,
      })
      .from(bookViews)
      .innerJoin(books, eq(bookViews.bookId, books.id))
      .where(where),
  ]);

  return {
    totalViews: totalViewsResult[0]?.value ?? 0,
    booksWithViews: booksWithViewsResult[0]?.value ?? 0,
  };
}

export async function getCreatorPurchaseClickTotals(
  { creatorId, creatorType }: CreatorAnalyticsScope,
  range?: AnalyticsDateRange | null,
) {
  const creatorFilter = creatorBookFilter(creatorId, creatorType);
  const dateFilter = buildCreatedAtFilter(purchaseClicks.createdAt, range);
  const where = dateFilter ? and(creatorFilter, dateFilter) : creatorFilter;

  const [totalClicksResult, booksWithClicksResult] = await Promise.all([
    db
      .select({ value: count() })
      .from(purchaseClicks)
      .innerJoin(books, eq(purchaseClicks.bookId, books.id))
      .where(where),
    db
      .select({
        value: sql<number>`count(distinct ${purchaseClicks.bookId})`,
      })
      .from(purchaseClicks)
      .innerJoin(books, eq(purchaseClicks.bookId, books.id))
      .where(where),
  ]);

  return {
    totalClicks: totalClicksResult[0]?.value ?? 0,
    booksWithClicks: booksWithClicksResult[0]?.value ?? 0,
  };
}

export async function getCreatorFunnelTotals(
  scope: CreatorAnalyticsScope,
  range?: AnalyticsDateRange | null,
): Promise<CreatorOverviewTotals> {
  const { creatorId, creatorType } = scope;
  const creatorFilter = creatorBookFilter(creatorId, creatorType);
  const wishlistFilter = buildCreatedAtFilter(wishlists.createdAt, range);
  const collectionFilter = buildCreatedAtFilter(
    collectionItems.createdAt,
    range,
  );

  const wishlistWhere = wishlistFilter
    ? and(creatorFilter, wishlistFilter)
    : creatorFilter;
  const collectionWhere = collectionFilter
    ? and(creatorFilter, collectionFilter)
    : creatorFilter;

  const [viewTotals, clickTotals, wishlistTotal, collectionTotal] =
    await Promise.all([
      getCreatorBookViewTotals(scope, range),
      getCreatorPurchaseClickTotals(scope, range),
      db
        .select({ value: count() })
        .from(wishlists)
        .innerJoin(books, eq(wishlists.bookId, books.id))
        .where(wishlistWhere),
      db
        .select({ value: count() })
        .from(collectionItems)
        .innerJoin(books, eq(collectionItems.bookId, books.id))
        .where(collectionWhere),
    ]);

  return {
    ...withClickRate({
      views: viewTotals.totalViews,
      wishlists: wishlistTotal[0]?.value ?? 0,
      collections: collectionTotal[0]?.value ?? 0,
      outboundClicks: clickTotals.totalClicks,
    }),
    booksWithViews: viewTotals.booksWithViews,
    booksWithClicks: clickTotals.booksWithClicks,
  };
}

async function getCreatorDailyCounts(
  scope: CreatorAnalyticsScope,
  table:
    | typeof bookViews
    | typeof purchaseClicks
    | typeof wishlists
    | typeof collectionItems,
  createdAtColumn:
    | typeof bookViews.createdAt
    | typeof purchaseClicks.createdAt
    | typeof wishlists.createdAt
    | typeof collectionItems.createdAt,
  range: AnalyticsDateRange,
) {
  const dateFilter = buildCreatedAtFilter(createdAtColumn, range);
  if (!dateFilter) return [];

  const creatorFilter = creatorBookFilter(scope.creatorId, scope.creatorType);

  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${createdAtColumn})::date`,
      value: count(),
    })
    .from(table)
    .innerJoin(books, eq(table.bookId, books.id))
    .where(and(creatorFilter, dateFilter))
    .groupBy(sql`date_trunc('day', ${createdAtColumn})::date`)
    .orderBy(sql`date_trunc('day', ${createdAtColumn})::date`);

  return rows;
}

async function getCreatorDailySourceCounts(
  scope: CreatorAnalyticsScope,
  table: typeof bookViews | typeof purchaseClicks,
  createdAtColumn: typeof bookViews.createdAt | typeof purchaseClicks.createdAt,
  sourceColumn: typeof bookViews.source | typeof purchaseClicks.source,
  range: AnalyticsDateRange,
) {
  const dateFilter = buildCreatedAtFilter(createdAtColumn, range);
  if (!dateFilter) return [];

  const creatorFilter = creatorBookFilter(scope.creatorId, scope.creatorType);

  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${createdAtColumn})::date`,
      source: sourceColumn,
      value: count(),
    })
    .from(table)
    .innerJoin(books, eq(table.bookId, books.id))
    .where(and(creatorFilter, dateFilter))
    .groupBy(sql`date_trunc('day', ${createdAtColumn})::date`, sourceColumn)
    .orderBy(sql`date_trunc('day', ${createdAtColumn})::date`);

  return rows.map((row) => ({
    day: row.day,
    source: row.source,
    value: row.value,
  }));
}

export async function getCreatorDailyFunnelTrends(
  scope: CreatorAnalyticsScope,
  range: AnalyticsDateRange,
): Promise<DailyTrendPoint[]> {
  const [views, clicks, wishlistRows, collectionRows] = await Promise.all([
    getCreatorDailyCounts(scope, bookViews, bookViews.createdAt, range),
    getCreatorDailyCounts(
      scope,
      purchaseClicks,
      purchaseClicks.createdAt,
      range,
    ),
    getCreatorDailyCounts(scope, wishlists, wishlists.createdAt, range),
    getCreatorDailyCounts(
      scope,
      collectionItems,
      collectionItems.createdAt,
      range,
    ),
  ]);

  return mergeDailyFunnelTrends(
    range,
    views,
    clicks,
    wishlistRows,
    collectionRows,
    [],
  );
}

export async function getCreatorDailySourceTrends(
  scope: CreatorAnalyticsScope,
  range: AnalyticsDateRange,
): Promise<DailySourceTrendPoint[]> {
  const [viewRows, clickRows] = await Promise.all([
    getCreatorDailySourceCounts(
      scope,
      bookViews,
      bookViews.createdAt,
      bookViews.source,
      range,
    ),
    getCreatorDailySourceCounts(
      scope,
      purchaseClicks,
      purchaseClicks.createdAt,
      purchaseClicks.source,
      range,
    ),
  ]);

  return mergeDailySourceTrends(range, viewRows, clickRows);
}

export async function getCreatorSourceTotals(
  scope: CreatorAnalyticsScope,
  range?: AnalyticsDateRange | null,
): Promise<SourceTotals> {
  const creatorFilter = creatorBookFilter(scope.creatorId, scope.creatorType);
  const viewFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const clickFilter = buildCreatedAtFilter(purchaseClicks.createdAt, range);

  const viewWhere = viewFilter ? and(creatorFilter, viewFilter) : creatorFilter;
  const clickWhere = clickFilter
    ? and(creatorFilter, clickFilter)
    : creatorFilter;

  const [viewRows, clickRows] = await Promise.all([
    db
      .select({
        source: bookViews.source,
        value: count(),
      })
      .from(bookViews)
      .innerJoin(books, eq(bookViews.bookId, books.id))
      .where(viewWhere)
      .groupBy(bookViews.source),
    db
      .select({
        source: purchaseClicks.source,
        value: count(),
      })
      .from(purchaseClicks)
      .innerJoin(books, eq(purchaseClicks.bookId, books.id))
      .where(clickWhere)
      .groupBy(purchaseClicks.source),
  ]);

  const totals: SourceTotals = {
    views: { web: 0, hyperview: 0 },
    clicks: { web: 0, hyperview: 0 },
  };
  for (const row of viewRows) totals.views[row.source] = row.value;
  for (const row of clickRows) totals.clicks[row.source] = row.value;

  return totals;
}
