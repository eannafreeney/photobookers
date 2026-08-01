import { and, count, eq, gte, isNotNull, lt } from "drizzle-orm";
import { db } from "../../db/client.js";
import { books, creators, users, wishlists } from "../../db/schema.js";
import {
  buildCreatedAtFilter,
  yesterdayAnalyticsDateRange
} from "../../features/book-analytics/dateRange.js";
import { getTopBooksByViews } from "../../features/book-views/services.js";
import { getTopCreatorsByViews } from "../../features/creator-views/services.js";
import { getNewsletterSignupsDashboard } from "../../features/newsletter-analytics/signups.js";
import { getPurchaseClickTotals } from "../../features/purchase-clicks/services.js";
import { err, ok } from "../../lib/result.js";
const DAILY_PRODUCT_DIGEST_TOP_LIMIT = 5;
function dayAfter(date) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}
async function countNewUsers(range) {
  const filter = buildCreatedAtFilter(users.createdAt, range);
  const [row] = await db.select({ value: count() }).from(users).where(and(filter, eq(users.isAdmin, false), eq(users.mustResetPassword, false)));
  return row?.value ?? 0;
}
async function countVerifiedCreators(range) {
  const end = dayAfter(range.to);
  const [row] = await db.select({ value: count() }).from(creators).where(
    and(
      eq(creators.status, "verified"),
      isNotNull(creators.verifiedAt),
      gte(creators.verifiedAt, range.from),
      lt(creators.verifiedAt, end)
    )
  );
  return row?.value ?? 0;
}
async function countNewBooks(range) {
  const filter = buildCreatedAtFilter(books.createdAt, range);
  const [row] = await db.select({ value: count() }).from(books).where(filter);
  return row?.value ?? 0;
}
async function countNewFavorites(range) {
  const filter = buildCreatedAtFilter(wishlists.createdAt, range);
  const [row] = await db.select({ value: count() }).from(wishlists).where(filter);
  return row?.value ?? 0;
}
async function countNewsletterSignups(range) {
  const [error, dashboard] = await getNewsletterSignupsDashboard(range);
  if (error) return null;
  return dashboard.overview.signupsInPeriod;
}
function resolveDailyProductDigestRange(referenceDate = /* @__PURE__ */ new Date()) {
  return yesterdayAnalyticsDateRange(referenceDate);
}
async function getDailyProductDigestSnapshot(referenceDate = /* @__PURE__ */ new Date()) {
  const range = resolveDailyProductDigestRange(referenceDate);
  const limit = DAILY_PRODUCT_DIGEST_TOP_LIMIT;
  try {
    const [
      newUsers,
      verifiedCreators,
      newBooks,
      newFavorites,
      newsletterSignups,
      clickTotals,
      topBooksResult,
      topArtistsResult,
      topPublishersResult
    ] = await Promise.all([
      countNewUsers(range),
      countVerifiedCreators(range),
      countNewBooks(range),
      countNewFavorites(range),
      countNewsletterSignups(range),
      getPurchaseClickTotals(range),
      getTopBooksByViews(range, 1, limit),
      getTopCreatorsByViews(range, 1, limit, "artist"),
      getTopCreatorsByViews(range, 1, limit, "publisher")
    ]);
    if (topBooksResult[0]) return err(topBooksResult[0]);
    if (topArtistsResult[0]) return err(topArtistsResult[0]);
    if (topPublishersResult[0]) return err(topPublishersResult[0]);
    return ok({
      range,
      growth: {
        newUsers,
        verifiedCreators,
        newBooks,
        newFavorites,
        newsletterSignups,
        outboundClicks: clickTotals.totalClicks
      },
      topBooksByViews: topBooksResult[1].books.map((book) => ({
        title: book.title,
        slug: book.slug,
        viewCount: book.viewCount,
        artistName: book.artistName,
        publisherName: book.publisherName
      })),
      topArtistsByViews: topArtistsResult[1].creators.map((creator) => ({
        displayName: creator.displayName,
        slug: creator.slug,
        type: creator.type,
        viewCount: creator.viewCount
      })),
      topPublishersByViews: topPublishersResult[1].creators.map((creator) => ({
        displayName: creator.displayName,
        slug: creator.slug,
        type: creator.type,
        viewCount: creator.viewCount
      }))
    });
  } catch (error) {
    console.error("Failed to load daily product digest", error);
    return err({ reason: "Failed to load daily product digest", cause: error });
  }
}
export {
  DAILY_PRODUCT_DIGEST_TOP_LIMIT,
  getDailyProductDigestSnapshot,
  resolveDailyProductDigestRange
};
