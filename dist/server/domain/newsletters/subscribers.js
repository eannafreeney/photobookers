import { LRUCache } from "lru-cache";
import {
  getBrevoConfig,
  getBrevoListStats
} from "../../lib/brevo/client.js";
const NEWSLETTER_SUBSCRIBER_MIN_DISPLAY = 50;
const CACHE_TTL_MS = 1e3 * 60 * 60;
const cache = new LRUCache({ max: 1, ttl: CACHE_TTL_MS });
function clearNewsletterSubscriberCacheForTests() {
  cache.clear();
}
async function getNewsletterSubscriberCount() {
  const cached = cache.get("default");
  if (cached !== void 0) return cached;
  const [configError, config] = getBrevoConfig();
  if (configError || !config) return null;
  const [statsError, stats] = await getBrevoListStats(
    config.apiKey,
    config.listId
  );
  if (statsError || !stats) return null;
  const count = stats.uniqueSubscribers || stats.totalSubscribers || 0;
  cache.set("default", count);
  return count;
}
function newsletterSubscriberLabel(count) {
  if (!count || count < NEWSLETTER_SUBSCRIBER_MIN_DISPLAY) return null;
  const rounded = count >= 1e3 ? Math.floor(count / 100) * 100 : Math.floor(count / 10) * 10;
  return `Join ${rounded.toLocaleString()}+ readers`;
}
export {
  NEWSLETTER_SUBSCRIBER_MIN_DISPLAY,
  clearNewsletterSubscriberCacheForTests,
  getNewsletterSubscriberCount,
  newsletterSubscriberLabel
};
