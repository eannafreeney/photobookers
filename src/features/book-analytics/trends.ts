import { count, sql } from "drizzle-orm";
import { db } from "../../db/client";
import {
  bookViews,
  collectionItems,
  follows,
  purchaseClicks,
  wishlists,
  type BookViewSource,
  type PurchaseClickSource,
} from "../../db/schema";
import { toDateString } from "../../lib/utils";
import {
  buildCreatedAtFilter,
  eachDayInRange,
  type AnalyticsDateRange,
} from "./dateRange";

export type DailyTrendPoint = {
  date: string;
  views: number;
  clicks: number;
  wishlists: number;
  collections: number;
  follows: number;
};

export type DailySourceTrendPoint = {
  date: string;
  viewsWeb: number;
  viewsHyperview: number;
  clicksWeb: number;
  clicksHyperview: number;
};

export type SourceTotals = {
  views: Record<BookViewSource, number>;
  clicks: Record<PurchaseClickSource, number>;
};

type DailyCountRow = { day: string; value: number };
type DailySourceRow = { day: string; source: string; value: number };

function emptySourceTotals(): SourceTotals {
  return {
    views: { web: 0, hyperview: 0 },
    clicks: { web: 0, hyperview: 0 },
  };
}

function normalizeDay(value: string | Date): string {
  if (value instanceof Date) return toDateString(value);
  return value.slice(0, 10);
}

export function mergeDailyFunnelTrends(
  range: AnalyticsDateRange,
  views: DailyCountRow[],
  clicks: DailyCountRow[],
  wishlistRows: DailyCountRow[],
  collectionRows: DailyCountRow[],
  followRows: DailyCountRow[],
): DailyTrendPoint[] {
  const viewsByDay = new Map(views.map((row) => [normalizeDay(row.day), row.value]));
  const clicksByDay = new Map(
    clicks.map((row) => [normalizeDay(row.day), row.value]),
  );
  const wishlistsByDay = new Map(
    wishlistRows.map((row) => [normalizeDay(row.day), row.value]),
  );
  const collectionsByDay = new Map(
    collectionRows.map((row) => [normalizeDay(row.day), row.value]),
  );
  const followsByDay = new Map(
    followRows.map((row) => [normalizeDay(row.day), row.value]),
  );

  return eachDayInRange(range).map((date) => ({
    date,
    views: viewsByDay.get(date) ?? 0,
    clicks: clicksByDay.get(date) ?? 0,
    wishlists: wishlistsByDay.get(date) ?? 0,
    collections: collectionsByDay.get(date) ?? 0,
    follows: followsByDay.get(date) ?? 0,
  }));
}

export function mergeDailySourceTrends(
  range: AnalyticsDateRange,
  viewRows: DailySourceRow[],
  clickRows: DailySourceRow[],
): DailySourceTrendPoint[] {
  const viewsByDay = new Map<string, { web: number; hyperview: number }>();
  const clicksByDay = new Map<string, { web: number; hyperview: number }>();

  for (const row of viewRows) {
    const day = normalizeDay(row.day);
    const entry = viewsByDay.get(day) ?? { web: 0, hyperview: 0 };
    if (row.source === "web" || row.source === "hyperview") {
      entry[row.source] = row.value;
    }
    viewsByDay.set(day, entry);
  }

  for (const row of clickRows) {
    const day = normalizeDay(row.day);
    const entry = clicksByDay.get(day) ?? { web: 0, hyperview: 0 };
    if (row.source === "web" || row.source === "hyperview") {
      entry[row.source] = row.value;
    }
    clicksByDay.set(day, entry);
  }

  return eachDayInRange(range).map((date) => {
    const views = viewsByDay.get(date) ?? { web: 0, hyperview: 0 };
    const clicks = clicksByDay.get(date) ?? { web: 0, hyperview: 0 };
    return {
      date,
      viewsWeb: views.web,
      viewsHyperview: views.hyperview,
      clicksWeb: clicks.web,
      clicksHyperview: clicks.hyperview,
    };
  });
}

async function getDailyCounts(
  table:
    | typeof bookViews
    | typeof purchaseClicks
    | typeof wishlists
    | typeof collectionItems
    | typeof follows,
  createdAtColumn:
    | typeof bookViews.createdAt
    | typeof purchaseClicks.createdAt
    | typeof wishlists.createdAt
    | typeof collectionItems.createdAt
    | typeof follows.createdAt,
  range: AnalyticsDateRange,
): Promise<DailyCountRow[]> {
  const dateFilter = buildCreatedAtFilter(createdAtColumn, range);
  if (!dateFilter) return [];

  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${createdAtColumn})::date`,
      value: count(),
    })
    .from(table)
    .where(dateFilter)
    .groupBy(sql`date_trunc('day', ${createdAtColumn})::date`)
    .orderBy(sql`date_trunc('day', ${createdAtColumn})::date`);

  return rows;
}

async function getDailySourceCounts(
  table: typeof bookViews | typeof purchaseClicks,
  createdAtColumn:
    | typeof bookViews.createdAt
    | typeof purchaseClicks.createdAt,
  sourceColumn:
    | typeof bookViews.source
    | typeof purchaseClicks.source,
  range: AnalyticsDateRange,
): Promise<DailySourceRow[]> {
  const dateFilter = buildCreatedAtFilter(createdAtColumn, range);
  if (!dateFilter) return [];

  const rows = await db
    .select({
      day: sql<string>`date_trunc('day', ${createdAtColumn})::date`,
      source: sourceColumn,
      value: count(),
    })
    .from(table)
    .where(dateFilter)
    .groupBy(
      sql`date_trunc('day', ${createdAtColumn})::date`,
      sourceColumn,
    )
    .orderBy(sql`date_trunc('day', ${createdAtColumn})::date`);

  return rows.map((row) => ({
    day: row.day,
    source: row.source,
    value: row.value,
  }));
}

export async function getDailyFunnelTrends(
  range: AnalyticsDateRange,
): Promise<DailyTrendPoint[]> {
  const [views, clicks, wishlistRows, collectionRows, followRows] =
    await Promise.all([
      getDailyCounts(bookViews, bookViews.createdAt, range),
      getDailyCounts(purchaseClicks, purchaseClicks.createdAt, range),
      getDailyCounts(wishlists, wishlists.createdAt, range),
      getDailyCounts(collectionItems, collectionItems.createdAt, range),
      getDailyCounts(follows, follows.createdAt, range),
    ]);

  return mergeDailyFunnelTrends(
    range,
    views,
    clicks,
    wishlistRows,
    collectionRows,
    followRows,
  );
}

export async function getFollowTotal(
  range?: AnalyticsDateRange | null,
): Promise<number> {
  const dateFilter = buildCreatedAtFilter(follows.createdAt, range);
  const result = dateFilter
    ? await db.select({ value: count() }).from(follows).where(dateFilter)
    : await db.select({ value: count() }).from(follows);
  return result[0]?.value ?? 0;
}

export async function getDailySourceTrends(
  range: AnalyticsDateRange,
): Promise<DailySourceTrendPoint[]> {
  const [viewRows, clickRows] = await Promise.all([
    getDailySourceCounts(
      bookViews,
      bookViews.createdAt,
      bookViews.source,
      range,
    ),
    getDailySourceCounts(
      purchaseClicks,
      purchaseClicks.createdAt,
      purchaseClicks.source,
      range,
    ),
  ]);

  return mergeDailySourceTrends(range, viewRows, clickRows);
}

export async function getSourceTotals(
  range?: AnalyticsDateRange | null,
): Promise<SourceTotals> {
  const viewFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const clickFilter = buildCreatedAtFilter(purchaseClicks.createdAt, range);

  const [viewRows, clickRows] = await Promise.all([
    viewFilter
      ? db
          .select({
            source: bookViews.source,
            value: count(),
          })
          .from(bookViews)
          .where(viewFilter)
          .groupBy(bookViews.source)
      : db
          .select({
            source: bookViews.source,
            value: count(),
          })
          .from(bookViews)
          .groupBy(bookViews.source),
    clickFilter
      ? db
          .select({
            source: purchaseClicks.source,
            value: count(),
          })
          .from(purchaseClicks)
          .where(clickFilter)
          .groupBy(purchaseClicks.source)
      : db
          .select({
            source: purchaseClicks.source,
            value: count(),
          })
          .from(purchaseClicks)
          .groupBy(purchaseClicks.source),
  ]);

  const totals = emptySourceTotals();
  for (const row of viewRows) {
    totals.views[row.source] = row.value;
  }
  for (const row of clickRows) {
    totals.clicks[row.source] = row.value;
  }

  return totals;
}
