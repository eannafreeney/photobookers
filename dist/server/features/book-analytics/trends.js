import { count, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  bookViews,
  collectionItems,
  follows,
  purchaseClicks,
  wishlists
} from "../../db/schema.js";
import { toDateString } from "../../lib/utils.js";
import {
  buildCreatedAtFilter,
  eachDayInRange
} from "./dateRange.js";
function emptySourceTotals() {
  return {
    views: { web: 0, hyperview: 0 },
    clicks: { web: 0, hyperview: 0 }
  };
}
function normalizeDay(value) {
  if (value instanceof Date) return toDateString(value);
  return value.slice(0, 10);
}
function mergeDailyFunnelTrends(range, views, clicks, wishlistRows, collectionRows, followRows) {
  const viewsByDay = new Map(views.map((row) => [normalizeDay(row.day), row.value]));
  const clicksByDay = new Map(
    clicks.map((row) => [normalizeDay(row.day), row.value])
  );
  const wishlistsByDay = new Map(
    wishlistRows.map((row) => [normalizeDay(row.day), row.value])
  );
  const collectionsByDay = new Map(
    collectionRows.map((row) => [normalizeDay(row.day), row.value])
  );
  const followsByDay = new Map(
    followRows.map((row) => [normalizeDay(row.day), row.value])
  );
  return eachDayInRange(range).map((date) => ({
    date,
    views: viewsByDay.get(date) ?? 0,
    clicks: clicksByDay.get(date) ?? 0,
    wishlists: wishlistsByDay.get(date) ?? 0,
    collections: collectionsByDay.get(date) ?? 0,
    follows: followsByDay.get(date) ?? 0
  }));
}
function mergeDailySourceTrends(range, viewRows, clickRows) {
  const viewsByDay = /* @__PURE__ */ new Map();
  const clicksByDay = /* @__PURE__ */ new Map();
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
      clicksHyperview: clicks.hyperview
    };
  });
}
async function getDailyCounts(table, createdAtColumn, range) {
  const dateFilter = buildCreatedAtFilter(createdAtColumn, range);
  if (!dateFilter) return [];
  const rows = await db.select({
    day: sql`date_trunc('day', ${createdAtColumn})::date`,
    value: count()
  }).from(table).where(dateFilter).groupBy(sql`date_trunc('day', ${createdAtColumn})::date`).orderBy(sql`date_trunc('day', ${createdAtColumn})::date`);
  return rows;
}
async function getDailySourceCounts(table, createdAtColumn, sourceColumn, range) {
  const dateFilter = buildCreatedAtFilter(createdAtColumn, range);
  if (!dateFilter) return [];
  const rows = await db.select({
    day: sql`date_trunc('day', ${createdAtColumn})::date`,
    source: sourceColumn,
    value: count()
  }).from(table).where(dateFilter).groupBy(
    sql`date_trunc('day', ${createdAtColumn})::date`,
    sourceColumn
  ).orderBy(sql`date_trunc('day', ${createdAtColumn})::date`);
  return rows.map((row) => ({
    day: row.day,
    source: row.source,
    value: row.value
  }));
}
async function getDailyFunnelTrends(range) {
  const [views, clicks, wishlistRows, collectionRows, followRows] = await Promise.all([
    getDailyCounts(bookViews, bookViews.createdAt, range),
    getDailyCounts(purchaseClicks, purchaseClicks.createdAt, range),
    getDailyCounts(wishlists, wishlists.createdAt, range),
    getDailyCounts(collectionItems, collectionItems.createdAt, range),
    getDailyCounts(follows, follows.createdAt, range)
  ]);
  return mergeDailyFunnelTrends(
    range,
    views,
    clicks,
    wishlistRows,
    collectionRows,
    followRows
  );
}
async function getFollowTotal(range) {
  const dateFilter = buildCreatedAtFilter(follows.createdAt, range);
  const result = dateFilter ? await db.select({ value: count() }).from(follows).where(dateFilter) : await db.select({ value: count() }).from(follows);
  return result[0]?.value ?? 0;
}
async function getDailySourceTrends(range) {
  const [viewRows, clickRows] = await Promise.all([
    getDailySourceCounts(
      bookViews,
      bookViews.createdAt,
      bookViews.source,
      range
    ),
    getDailySourceCounts(
      purchaseClicks,
      purchaseClicks.createdAt,
      purchaseClicks.source,
      range
    )
  ]);
  return mergeDailySourceTrends(range, viewRows, clickRows);
}
async function getSourceTotals(range) {
  const viewFilter = buildCreatedAtFilter(bookViews.createdAt, range);
  const clickFilter = buildCreatedAtFilter(purchaseClicks.createdAt, range);
  const [viewRows, clickRows] = await Promise.all([
    viewFilter ? db.select({
      source: bookViews.source,
      value: count()
    }).from(bookViews).where(viewFilter).groupBy(bookViews.source) : db.select({
      source: bookViews.source,
      value: count()
    }).from(bookViews).groupBy(bookViews.source),
    clickFilter ? db.select({
      source: purchaseClicks.source,
      value: count()
    }).from(purchaseClicks).where(clickFilter).groupBy(purchaseClicks.source) : db.select({
      source: purchaseClicks.source,
      value: count()
    }).from(purchaseClicks).groupBy(purchaseClicks.source)
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
export {
  getDailyFunnelTrends,
  getDailySourceTrends,
  getFollowTotal,
  getSourceTotals,
  mergeDailyFunnelTrends,
  mergeDailySourceTrends
};
