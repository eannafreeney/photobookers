import { LRUCache } from "lru-cache";
import {
  getBrevoConfig,
  getBrevoListStats,
} from "../../lib/brevo/client";

/** Below this the count is not proof of anything — better to say nothing. */
export const NEWSLETTER_SUBSCRIBER_MIN_DISPLAY = 500;

const CACHE_TTL_MS = 1000 * 60 * 60;
const cache = new LRUCache<string, number>({ max: 1, ttl: CACHE_TTL_MS });

export function clearNewsletterSubscriberCacheForTests(): void {
  cache.clear();
}

/**
 * Subscriber count for social proof. Cached for an hour and never throws —
 * the newsletter form must render whether or not Brevo answers.
 */
export async function getNewsletterSubscriberCount(): Promise<number | null> {
  const cached = cache.get("default");
  if (cached !== undefined) return cached;

  const [configError, config] = getBrevoConfig();
  if (configError || !config) return null;

  const [statsError, stats] = await getBrevoListStats(
    config.apiKey,
    config.listId,
  );
  if (statsError || !stats) return null;

  const count = stats.uniqueSubscribers || stats.totalSubscribers || 0;
  cache.set("default", count);
  return count;
}

/** "Join 1,204 readers" — or nothing at all when the number is too small. */
export function newsletterSubscriberLabel(
  count: number | null | undefined,
): string | null {
  if (!count || count < NEWSLETTER_SUBSCRIBER_MIN_DISPLAY) return null;

  // Round down to a clean figure so the copy doesn't wobble every signup.
  const rounded =
    count >= 1000
      ? Math.floor(count / 100) * 100
      : Math.floor(count / 10) * 10;

  return `Join ${rounded.toLocaleString()}+ readers`;
}
