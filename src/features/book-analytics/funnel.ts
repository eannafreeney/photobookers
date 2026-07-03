import { and, count, eq, or } from "drizzle-orm";
import { db } from "../../db/client";
import {
  books,
  collectionItems,
  wishlists,
  type CreatorType,
} from "../../db/schema";
import { findCollectionCounts, findWishlistCounts } from "../api/services";
import {
  findBookViewCounts,
  getCreatorBookViewTotal,
  getCreatorCatalogueBookViewTotal,
  getBookViewTotals,
} from "../book-views/services";
import {
  findPurchaseClickCounts,
  getCreatorCataloguePurchaseClickTotal,
  getCreatorPurchaseClickTotal,
  getPurchaseClickTotals,
} from "../purchase-clicks/services";
import { buildCreatedAtFilter, type AnalyticsDateRange } from "./dateRange";

export type BookFunnelCounts = {
  views: number;
  favorites: number;
  outboundClicks: number;
};

export type CatalogueFunnelTotals = BookFunnelCounts & {
  clickRate: number | null;
};

export type CatalogueFunnelTotalsWithBooks = {
  totals: CatalogueFunnelTotals & {
    bookwWithViews: number;
    bookWithClicks: number;
  };
};

export function formatClickRate(views: number, clicks: number): string | null {
  if (views <= 0) return null;
  const rate = (clicks / views) * 100;
  if (rate > 0 && rate < 0.1) return "<0.1%";
  return `${rate.toFixed(1)}%`;
}

export async function getBookFunnelCounts(
  bookIds: string[],
): Promise<Map<string, BookFunnelCounts>> {
  if (bookIds.length === 0) return new Map();

  const [views, wishlistMap, outboundClicks] = await Promise.all([
    findBookViewCounts(bookIds),
    findWishlistCounts(bookIds),
    findPurchaseClickCounts(bookIds),
  ]);

  const result = new Map<string, BookFunnelCounts>();
  for (const bookId of bookIds) {
    result.set(bookId, {
      views: views.get(bookId) ?? 0,
      favorites: wishlistMap.get(bookId) ?? 0,
      outboundClicks: outboundClicks.get(bookId) ?? 0,
    });
  }
  return result;
}

async function getCreatorEngagementTotal(
  creatorId: string,
  role: CreatorType,
  table: typeof wishlists | typeof collectionItems,
) {
  const creatorColumn =
    role === "publisher" ? books.publisherId : books.artistId;

  const result = await db
    .select({ value: count() })
    .from(table)
    .innerJoin(books, eq(table.bookId, books.id))
    .where(eq(creatorColumn, creatorId));

  return result[0]?.value ?? 0;
}

async function getCreatorCatalogueEngagementTotal(
  creatorId: string,
  table: typeof wishlists | typeof collectionItems,
) {
  const result = await db
    .select({ value: count() })
    .from(table)
    .innerJoin(books, eq(table.bookId, books.id))
    .where(or(eq(books.artistId, creatorId), eq(books.publisherId, creatorId)));

  return result[0]?.value ?? 0;
}

export function withClickRate(totals: BookFunnelCounts): CatalogueFunnelTotals {
  return {
    ...totals,
    clickRate:
      totals.views > 0
        ? Math.round((totals.outboundClicks / totals.views) * 1000) / 10
        : null,
  };
}

export async function getCreatorCatalogueFunnelTotals(
  creatorId: string,
  role: CreatorType,
): Promise<CatalogueFunnelTotals> {
  const [views, wishlistTotal, outboundClicks] = await Promise.all([
    getCreatorBookViewTotal(creatorId, role),
    getCreatorEngagementTotal(creatorId, role, wishlists),
    getCreatorPurchaseClickTotal(creatorId, role),
  ]);

  return withClickRate({
    views,
    favorites: wishlistTotal,
    outboundClicks,
  });
}

export async function getCreatorCatalogueFunnelTotalsAdmin(
  creatorId: string,
): Promise<CatalogueFunnelTotals> {
  const [views, wishlistTotal, outboundClicks] = await Promise.all([
    getCreatorCatalogueBookViewTotal(creatorId),
    getCreatorCatalogueEngagementTotal(creatorId, wishlists),
    getCreatorCataloguePurchaseClickTotal(creatorId),
  ]);

  return withClickRate({
    views,
    favorites: wishlistTotal,
    outboundClicks,
  });
}

export async function getOverallFunnelTotals(
  range?: AnalyticsDateRange | null,
): Promise<CatalogueFunnelTotals> {
  const wishlistFilter = buildCreatedAtFilter(wishlists.createdAt, range);
  const collectionFilter = buildCreatedAtFilter(
    collectionItems.createdAt,
    range,
  );

  const [viewTotals, clickTotals, wishlistTotal, collectionTotal] =
    await Promise.all([
      getBookViewTotals(range),
      getPurchaseClickTotals(range),
      wishlistFilter
        ? db.select({ value: count() }).from(wishlists).where(wishlistFilter)
        : db.select({ value: count() }).from(wishlists),
      collectionFilter
        ? db
            .select({ value: count() })
            .from(collectionItems)
            .where(collectionFilter)
        : db.select({ value: count() }).from(collectionItems),
    ]);

  return withClickRate({
    views: viewTotals.totalViews,
    favorites: wishlistTotal[0]?.value ?? 0,
    outboundClicks: clickTotals.totalClicks,
  });
}
