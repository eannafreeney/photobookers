import { and, count, eq, gte, lt, or, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { db } from "../../db/client";
import { bookOfTheDay, purchaseClicks } from "../../db/schema";
import { type AnalyticsDateRange } from "../../features/book-analytics/dateRange";
import { getNewsletterSignupsDashboard } from "../../features/newsletter-analytics/signups";
import {
  getBrevoConfig,
  getBrevoListStats,
  listRecentSentBrevoCampaigns,
} from "../../lib/brevo/client";
import { err, ok, type Result } from "../../lib/result";
import { EDITORIAL_REFERER_PATHS } from "../ceo-metrics/editorial";
import { formatPeriodDelta, previousPeriodRange } from "../ceo-metrics/format";
import { pickLatestSentCampaign } from "./brevoCampaignStats";
import { newsletterGrowthRange } from "./format";
import type { NewsletterGrowthReport } from "./types";

type ServiceError = { reason: string; cause?: unknown };

function dayAfter(date: Date): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function rangeEndExclusive(range: AnalyticsDateRange): Date {
  return dayAfter(range.to);
}

function createdInRange(column: AnyPgColumn, range: AnalyticsDateRange) {
  return and(gte(column, range.from), lt(column, rangeEndExclusive(range)));
}

async function countClicks(
  range: AnalyticsDateRange,
  extra?: SQL,
): Promise<number> {
  const filter = extra
    ? and(createdInRange(purchaseClicks.createdAt, range), extra)
    : createdInRange(purchaseClicks.createdAt, range);
  const [row] = await db
    .select({ value: count() })
    .from(purchaseClicks)
    .where(filter);
  return row?.value ?? 0;
}

function editorialRefererFilter() {
  const patterns = EDITORIAL_REFERER_PATHS.map(
    (path) => sql`${purchaseClicks.referer} ILIKE ${`%${path}%`}`,
  );
  return or(...patterns);
}

async function countBotdPageBuyClicks(range: AnalyticsDateRange): Promise<number> {
  return countClicks(
    range,
    sql`${purchaseClicks.referer} ILIKE ${"%/book-of-the-day%"}`,
  );
}

async function countEditorialBuyClicks(
  range: AnalyticsDateRange,
): Promise<number> {
  return countClicks(range, editorialRefererFilter());
}

async function countBotdBookBuyClicks(
  range: AnalyticsDateRange,
): Promise<number> {
  const end = rangeEndExclusive(range);
  const [row] = await db
    .select({ value: count() })
    .from(purchaseClicks)
    .innerJoin(bookOfTheDay, eq(purchaseClicks.bookId, bookOfTheDay.bookId))
    .where(
      and(
        createdInRange(purchaseClicks.createdAt, range),
        gte(bookOfTheDay.date, range.from),
        lt(bookOfTheDay.date, end),
      ),
    );
  return row?.value ?? 0;
}

export async function getNewsletterGrowthReport(
  asOf: Date = new Date(),
): Promise<Result<NewsletterGrowthReport, ServiceError>> {
  const range = newsletterGrowthRange(asOf);
  const previousRange = previousPeriodRange(range);

  const [configError, config] = getBrevoConfig();
  if (configError) return err(configError);

  try {
    const [
      [statsError, listStats],
      [thisWeekError, thisWeek],
      [lastWeekError, lastWeek],
      [campaignsError, campaigns],
      editorialBuyClicks,
      priorEditorialBuyClicks,
      botdPageBuyClicks,
      botdBookBuyClicks,
      allBuyClicks,
    ] = await Promise.all([
      getBrevoListStats(config.apiKey, config.listId),
      getNewsletterSignupsDashboard(range),
      getNewsletterSignupsDashboard(previousRange),
      listRecentSentBrevoCampaigns(config.apiKey),
      countEditorialBuyClicks(range),
      countEditorialBuyClicks(previousRange),
      countBotdPageBuyClicks(range),
      countBotdBookBuyClicks(range),
      countClicks(range),
    ]);

    if (statsError) return err(statsError);
    if (thisWeekError) return err(thisWeekError);
    if (lastWeekError) return err(lastWeekError);

    const campaign = campaignsError
      ? null
      : pickLatestSentCampaign(campaigns ?? []);

    const signupsThisWeek = thisWeek.overview.signupsInPeriod;
    const signupsLastWeek = lastWeek.overview.signupsInPeriod;

    return ok({
      range,
      previousRange,
      totalSubscribers: listStats.uniqueSubscribers,
      signupsThisWeek,
      signupsLastWeek,
      signupsDelta: formatPeriodDelta(signupsThisWeek, signupsLastWeek),
      campaign,
      editorialBuyClicks,
      editorialBuyClicksDelta: formatPeriodDelta(
        editorialBuyClicks,
        priorEditorialBuyClicks,
      ),
      botdPageBuyClicks,
      botdBookBuyClicks,
      allBuyClicks,
    });
  } catch (error) {
    console.error("getNewsletterGrowthReport", error);
    return err({ reason: "Failed to load newsletter growth report", cause: error });
  }
}
