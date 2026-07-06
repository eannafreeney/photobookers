import { LRUCache } from "lru-cache";
import {
  eachDayInRange,
  presetAnalyticsDateRange
} from "../book-analytics/dateRange.js";
import {
  fetchBrevoListContacts,
  getBrevoConfig,
  getBrevoListDashboardUrl,
  getBrevoListStats
} from "../../lib/brevo/client.js";
import { err, ok } from "../../lib/result.js";
import { toDateString, toUtcStartOfDay } from "../../lib/utils.js";
const cache = new LRUCache({
  max: 50,
  ttl: 1e3 * 60 * 15
});
function resolveNewsletterDateRange(dateRange) {
  if (dateRange) {
    return { range: dateRange, usesDefaultRange: false };
  }
  return {
    range: presetAnalyticsDateRange(30),
    usesDefaultRange: true
  };
}
function cacheKey(listId, range) {
  return `${listId}|${toDateString(range.from)}|${toDateString(range.to)}`;
}
function endOfDayUtc(date) {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}
function filterContactsInRange(contacts, range) {
  const rangeEnd = endOfDayUtc(range.to);
  return contacts.filter((contact) => {
    const createdAt = new Date(contact.createdAt);
    return createdAt >= range.from && createdAt <= rangeEnd;
  });
}
function buildDailySignupTrend(contacts, range) {
  const days = eachDayInRange(range);
  const counts = new Map(days.map((date) => [date, 0]));
  for (const contact of contacts) {
    const day = toDateString(toUtcStartOfDay(new Date(contact.createdAt)));
    if (!counts.has(day)) continue;
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return days.map((date) => ({
    date,
    signups: counts.get(date) ?? 0
  }));
}
function buildNewsletterSignupsDashboard(params) {
  const filteredContacts = filterContactsInRange(params.contacts, params.range);
  const dailyTrend = buildDailySignupTrend(filteredContacts, params.range);
  return {
    usesDefaultRange: params.usesDefaultRange,
    listId: params.listId,
    listName: params.listName,
    brevoListUrl: getBrevoListDashboardUrl(params.listId),
    totalSubscribers: params.totalSubscribers,
    overview: {
      signupsInPeriod: filteredContacts.length
    },
    dailyTrend
  };
}
function clearNewsletterSignupsCacheForTests() {
  cache.clear();
}
async function getNewsletterSignupsDashboard(dateRange) {
  const [configError, config] = getBrevoConfig();
  if (configError) return err(configError);
  const { range, usesDefaultRange } = resolveNewsletterDateRange(dateRange);
  const key = cacheKey(config.listId, range);
  const cached = cache.get(key);
  if (cached) return ok(cached);
  try {
    const [[statsError, stats], [contactsError, contacts]] = await Promise.all([
      getBrevoListStats(config.apiKey, config.listId),
      fetchBrevoListContacts(config.apiKey, config.listId, {
        createdSince: range.from
      })
    ]);
    if (statsError) return err(statsError);
    if (contactsError) return err(contactsError);
    const dashboard = buildNewsletterSignupsDashboard({
      listId: config.listId,
      listName: stats.name,
      usesDefaultRange,
      totalSubscribers: stats.uniqueSubscribers,
      contacts,
      range
    });
    cache.set(key, dashboard);
    return ok(dashboard);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Brevo newsletter signup data";
    return err({ reason: message });
  }
}
export {
  buildDailySignupTrend,
  buildNewsletterSignupsDashboard,
  clearNewsletterSignupsCacheForTests,
  filterContactsInRange,
  getNewsletterSignupsDashboard
};
