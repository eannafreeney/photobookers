import { LRUCache } from "lru-cache";
import { eachDayInRange } from "../book-analytics/dateRange";
import type { AnalyticsDateRange } from "../book-analytics/dateRange";
import { err, ok, type Result } from "../../lib/result";
import { getAscConfig, type AscConfig } from "./config";
import { resolveAscDateRange } from "./dateRange";
import {
  fetchDailySalesReport,
  summarizeDownloadsByCountry,
  summarizeDownloadsForApp,
  type CountryDownloadRow,
  type DailyDownloadCounts,
} from "./reports";

export type AppDownloadsOverview = DailyDownloadCounts;

export type DailyDownloadPoint = {
  date: string;
  downloads: number;
  firstTimeDownloads: number;
  redownloads: number;
};

export type AppDownloadsDashboard = {
  usesDefaultRange: boolean;
  overview: AppDownloadsOverview;
  dailyTrend: DailyDownloadPoint[];
  topCountries: CountryDownloadRow[];
};

const cache = new LRUCache<string, AppDownloadsDashboard>({
  max: 50,
  ttl: 1000 * 60 * 15,
});

function cacheKey(range: ReturnType<typeof resolveAscDateRange>, appId: string) {
  return `${appId}|${range.startDate}|${range.endDate}`;
}

function dateRangeFromAscRange(range: ReturnType<typeof resolveAscDateRange>) {
  return {
    from: new Date(`${range.startDate}T00:00:00.000Z`),
    to: new Date(`${range.endDate}T00:00:00.000Z`),
  } satisfies AnalyticsDateRange;
}

function emptyCounts(): DailyDownloadCounts {
  return { downloads: 0, firstTimeDownloads: 0, redownloads: 0 };
}

function addCounts(
  total: DailyDownloadCounts,
  next: DailyDownloadCounts,
): DailyDownloadCounts {
  return {
    downloads: total.downloads + next.downloads,
    firstTimeDownloads: total.firstTimeDownloads + next.firstTimeDownloads,
    redownloads: total.redownloads + next.redownloads,
  };
}

export function buildDashboardFromDailyPoints(
  range: ReturnType<typeof resolveAscDateRange>,
  points: DailyDownloadPoint[],
  topCountries: CountryDownloadRow[] = [],
): AppDownloadsDashboard {
  const overview = points.reduce(
    (total, point) =>
      addCounts(total, {
        downloads: point.downloads,
        firstTimeDownloads: point.firstTimeDownloads,
        redownloads: point.redownloads,
      }),
    emptyCounts(),
  );

  return {
    usesDefaultRange: range.usesDefaultRange,
    overview,
    dailyTrend: points,
    topCountries,
  };
}

async function fetchDashboardData(
  config: AscConfig,
  range: ReturnType<typeof resolveAscDateRange>,
): Promise<{
  dailyTrend: DailyDownloadPoint[];
  topCountries: CountryDownloadRow[];
}> {
  const days = eachDayInRange(dateRangeFromAscRange(range));
  const dailyTrend: DailyDownloadPoint[] = [];
  const countryTotals = new Map<string, CountryDownloadRow>();

  for (const date of days) {
    const rows = await fetchDailySalesReport(config, date);
    const counts =
      rows === null
        ? emptyCounts()
        : summarizeDownloadsForApp(rows, config.appId);
    const countryRows =
      rows === null ? [] : summarizeDownloadsByCountry(rows, config.appId);

    dailyTrend.push({
      date,
      downloads: counts.downloads,
      firstTimeDownloads: counts.firstTimeDownloads,
      redownloads: counts.redownloads,
    });

    for (const row of countryRows) {
      const entry = countryTotals.get(row.countryCode) ?? {
        countryCode: row.countryCode,
        downloads: 0,
        firstTimeDownloads: 0,
        redownloads: 0,
      };

      entry.downloads += row.downloads;
      entry.firstTimeDownloads += row.firstTimeDownloads;
      entry.redownloads += row.redownloads;
      countryTotals.set(row.countryCode, entry);
    }
  }

  const topCountries = [...countryTotals.values()]
    .sort((a, b) => {
      if (b.downloads !== a.downloads) return b.downloads - a.downloads;
      return a.countryCode.localeCompare(b.countryCode);
    })
    .slice(0, 10);

  return { dailyTrend, topCountries };
}

export function clearAppDownloadsCacheForTests(): void {
  cache.clear();
}

export async function getAppDownloadsDashboard(
  dateRange: AnalyticsDateRange | null,
): Promise<Result<AppDownloadsDashboard, { reason: string }>> {
  const [configError, config] = getAscConfig();
  if (configError) return err(configError);

  const ascRange = resolveAscDateRange(dateRange);
  const key = cacheKey(ascRange, config.appId);
  const cached = cache.get(key);
  if (cached) return ok(cached);

  try {
    const { dailyTrend, topCountries } = await fetchDashboardData(
      config,
      ascRange,
    );
    const dashboard = buildDashboardFromDailyPoints(
      ascRange,
      dailyTrend,
      topCountries,
    );
    cache.set(key, dashboard);
    return ok(dashboard);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load App Store Connect download data";
    return err({ reason: message });
  }
}

// Exported for unit tests
export const appDownloadsParsers = {
  summarizeDownloadsForApp,
  summarizeDownloadsByCountry,
  buildDashboardFromDailyPoints,
};
