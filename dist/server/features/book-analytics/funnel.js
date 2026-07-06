import { count, eq, or } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  books,
  collectionItems,
  wishlists
} from "../../db/schema.js";
import { findWishlistCounts } from "../api/services.js";
import {
  findBookViewCounts,
  getCreatorBookViewTotal,
  getCreatorCatalogueBookViewTotal,
  getBookViewTotals
} from "../book-views/services.js";
import {
  findPurchaseClickCounts,
  getCreatorCataloguePurchaseClickTotal,
  getCreatorPurchaseClickTotal,
  getPurchaseClickTotals
} from "../purchase-clicks/services.js";
import { buildCreatedAtFilter } from "./dateRange.js";
function formatClickRate(views, clicks) {
  if (views <= 0) return null;
  const rate = clicks / views * 100;
  if (rate > 0 && rate < 0.1) return "<0.1%";
  return `${rate.toFixed(1)}%`;
}
async function getBookFunnelCounts(bookIds) {
  if (bookIds.length === 0) return /* @__PURE__ */ new Map();
  const [views, wishlistMap, outboundClicks] = await Promise.all([
    findBookViewCounts(bookIds),
    findWishlistCounts(bookIds),
    findPurchaseClickCounts(bookIds)
  ]);
  const result = /* @__PURE__ */ new Map();
  for (const bookId of bookIds) {
    result.set(bookId, {
      views: views.get(bookId) ?? 0,
      favorites: wishlistMap.get(bookId) ?? 0,
      outboundClicks: outboundClicks.get(bookId) ?? 0
    });
  }
  return result;
}
async function getCreatorEngagementTotal(creatorId, role, table) {
  const creatorColumn = role === "publisher" ? books.publisherId : books.artistId;
  const result = await db.select({ value: count() }).from(table).innerJoin(books, eq(table.bookId, books.id)).where(eq(creatorColumn, creatorId));
  return result[0]?.value ?? 0;
}
async function getCreatorCatalogueEngagementTotal(creatorId, table) {
  const result = await db.select({ value: count() }).from(table).innerJoin(books, eq(table.bookId, books.id)).where(or(eq(books.artistId, creatorId), eq(books.publisherId, creatorId)));
  return result[0]?.value ?? 0;
}
function withClickRate(totals) {
  return {
    ...totals,
    clickRate: totals.views > 0 ? Math.round(totals.outboundClicks / totals.views * 1e3) / 10 : null
  };
}
async function getCreatorCatalogueFunnelTotals(creatorId, role) {
  const [views, wishlistTotal, outboundClicks] = await Promise.all([
    getCreatorBookViewTotal(creatorId, role),
    getCreatorEngagementTotal(creatorId, role, wishlists),
    getCreatorPurchaseClickTotal(creatorId, role)
  ]);
  return withClickRate({
    views,
    favorites: wishlistTotal,
    outboundClicks
  });
}
async function getCreatorCatalogueFunnelTotalsAdmin(creatorId) {
  const [views, wishlistTotal, outboundClicks] = await Promise.all([
    getCreatorCatalogueBookViewTotal(creatorId),
    getCreatorCatalogueEngagementTotal(creatorId, wishlists),
    getCreatorCataloguePurchaseClickTotal(creatorId)
  ]);
  return withClickRate({
    views,
    favorites: wishlistTotal,
    outboundClicks
  });
}
async function getOverallFunnelTotals(range) {
  const wishlistFilter = buildCreatedAtFilter(wishlists.createdAt, range);
  const collectionFilter = buildCreatedAtFilter(
    collectionItems.createdAt,
    range
  );
  const [viewTotals, clickTotals, wishlistTotal, collectionTotal] = await Promise.all([
    getBookViewTotals(range),
    getPurchaseClickTotals(range),
    wishlistFilter ? db.select({ value: count() }).from(wishlists).where(wishlistFilter) : db.select({ value: count() }).from(wishlists),
    collectionFilter ? db.select({ value: count() }).from(collectionItems).where(collectionFilter) : db.select({ value: count() }).from(collectionItems)
  ]);
  return withClickRate({
    views: viewTotals.totalViews,
    favorites: wishlistTotal[0]?.value ?? 0,
    outboundClicks: clickTotals.totalClicks
  });
}
export {
  formatClickRate,
  getBookFunnelCounts,
  getCreatorCatalogueFunnelTotals,
  getCreatorCatalogueFunnelTotalsAdmin,
  getOverallFunnelTotals,
  withClickRate
};
