import { LRUCache } from "lru-cache";
import { presetAnalyticsDateRange } from "../book-analytics/dateRange.js";
import { getBookViewTotals } from "../book-views/services.js";
import { getCreatorViewTotals } from "../creator-views/services.js";
import { err, ok } from "../../lib/result.js";
import {
  HOMEPAGE_ACTIVITY_MIN_VIEWS,
  visibleHomepageActivityParts
} from "./homepageActivityVisibility.js";
const cache = new LRUCache({
  max: 1,
  ttl: 1e3 * 60 * 10
});
function clearHomepageActivityCacheForTests() {
  cache.clear();
}
async function getHomepageActivityStats() {
  const cached = cache.get("default");
  if (cached) return ok(cached);
  try {
    const range = presetAnalyticsDateRange(7);
    const [bookTotals, creatorTotals] = await Promise.all([
      getBookViewTotals(range),
      getCreatorViewTotals(range)
    ]);
    const stats = {
      bookViews: bookTotals.booksWithViews,
      profileViews: creatorTotals.publisherPageViews + creatorTotals.artistPageViews
    };
    cache.set("default", stats);
    return ok(stats);
  } catch (error) {
    console.error("Failed to get homepage activity stats", error);
    return err({ reason: "Failed to get homepage activity stats", error });
  }
}
export {
  HOMEPAGE_ACTIVITY_MIN_VIEWS,
  clearHomepageActivityCacheForTests,
  getHomepageActivityStats,
  visibleHomepageActivityParts
};
