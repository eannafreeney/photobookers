import { LRUCache } from "lru-cache";
import {
  eachDayInRange,
  presetAnalyticsDateRange,
  type AnalyticsDateRange,
} from "../book-analytics/dateRange";
import {
  fetchBrevoListContacts,
  getBrevoConfig,
  getBrevoListDashboardUrl,
  getBrevoListStats,
  type BrevoContactSummary,
} from "../../lib/brevo/client";
import { err, ok, type Result } from "../../lib/result";
import { toDateString, toUtcStartOfDay } from "../../lib/utils";

export type DailySignupPoint = {
  date: string;
  signups: number;
};

export type NewsletterSignupsDashboard = {
  usesDefaultRange: boolean;
  listId: number;
  listName: string;
  brevoListUrl: string;
  totalSubscribers: number;
  overview: {
    signupsInPeriod: number;
  };
  dailyTrend: DailySignupPoint[];
};

type NewsletterDateRange = {
  range: AnalyticsDateRange;
  usesDefaultRange: boolean;
};

const cache = new LRUCache<string, NewsletterSignupsDashboard>({
  max: 50,
  ttl: 1000 * 60 * 15,
});

function resolveNewsletterDateRange(
  dateRange: AnalyticsDateRange | null,
): NewsletterDateRange {
  if (dateRange) {
    return { range: dateRange, usesDefaultRange: false };
  }
  return {
    range: presetAnalyticsDateRange(30),
    usesDefaultRange: true,
  };
}

function cacheKey(listId: number, range: AnalyticsDateRange): string {
  return `${listId}|${toDateString(range.from)}|${toDateString(range.to)}`;
}

function endOfDayUtc(date: Date): Date {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

export function filterContactsInRange(
  contacts: BrevoContactSummary[],
  range: AnalyticsDateRange,
): BrevoContactSummary[] {
  const rangeEnd = endOfDayUtc(range.to);
  return contacts.filter((contact) => {
    const createdAt = new Date(contact.createdAt);
    return createdAt >= range.from && createdAt <= rangeEnd;
  });
}

export function buildDailySignupTrend(
  contacts: BrevoContactSummary[],
  range: AnalyticsDateRange,
): DailySignupPoint[] {
  const days = eachDayInRange(range);
  const counts = new Map<string, number>(days.map((date) => [date, 0]));

  for (const contact of contacts) {
    const day = toDateString(toUtcStartOfDay(new Date(contact.createdAt)));
    if (!counts.has(day)) continue;
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return days.map((date) => ({
    date,
    signups: counts.get(date) ?? 0,
  }));
}

export function buildNewsletterSignupsDashboard(params: {
  listId: number;
  listName: string;
  usesDefaultRange: boolean;
  totalSubscribers: number;
  contacts: BrevoContactSummary[];
  range: AnalyticsDateRange;
}): NewsletterSignupsDashboard {
  const filteredContacts = filterContactsInRange(params.contacts, params.range);
  const dailyTrend = buildDailySignupTrend(filteredContacts, params.range);

  return {
    usesDefaultRange: params.usesDefaultRange,
    listId: params.listId,
    listName: params.listName,
    brevoListUrl: getBrevoListDashboardUrl(params.listId),
    totalSubscribers: params.totalSubscribers,
    overview: {
      signupsInPeriod: filteredContacts.length,
    },
    dailyTrend,
  };
}

export function clearNewsletterSignupsCacheForTests(): void {
  cache.clear();
}

export async function getNewsletterSignupsDashboard(
  dateRange: AnalyticsDateRange | null,
): Promise<Result<NewsletterSignupsDashboard, { reason: string }>> {
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
        createdSince: range.from,
      }),
    ]);

    if (statsError) return err(statsError);
    if (contactsError) return err(contactsError);

    const dashboard = buildNewsletterSignupsDashboard({
      listId: config.listId,
      listName: stats.name,
      usesDefaultRange,
      totalSubscribers: stats.uniqueSubscribers,
      contacts,
      range,
    });

    cache.set(key, dashboard);
    return ok(dashboard);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load Brevo newsletter signup data";
    return err({ reason: message });
  }
}
