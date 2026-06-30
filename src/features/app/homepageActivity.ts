import { LRUCache } from "lru-cache";
import { presetAnalyticsDateRange } from "../book-analytics/dateRange";
import { getBookViewTotals } from "../book-views/services";
import { getCreatorViewTotals } from "../creator-views/services";
import { err, ok, type Result } from "../../lib/result";
import type { HomepageActivityStats } from "./homepageActivityVisibility";

export type { HomepageActivityStats } from "./homepageActivityVisibility";
export {
  HOMEPAGE_ACTIVITY_MIN_VIEWS,
  visibleHomepageActivityParts,
} from "./homepageActivityVisibility";

const cache = new LRUCache<string, HomepageActivityStats>({
  max: 1,
  ttl: 1000 * 60 * 10,
});

export function clearHomepageActivityCacheForTests(): void {
  cache.clear();
}

export async function getHomepageActivityStats(): Promise<
  Result<HomepageActivityStats, { reason: string }>
> {
  const cached = cache.get("default");
  if (cached) return ok(cached);

  try {
    const range = presetAnalyticsDateRange(7);
    const [bookTotals, creatorTotals] = await Promise.all([
      getBookViewTotals(range),
      getCreatorViewTotals(range),
    ]);

    const stats: HomepageActivityStats = {
      bookViews: bookTotals.booksWithViews,
      profileViews:
        creatorTotals.publisherPageViews + creatorTotals.artistPageViews,
    };
    cache.set("default", stats);
    return ok(stats);
  } catch (error) {
    console.error("Failed to get homepage activity stats", error);
    return err({ reason: "Failed to get homepage activity stats", error });
  }
}
