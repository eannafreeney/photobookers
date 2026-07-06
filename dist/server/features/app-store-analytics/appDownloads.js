import { LRUCache } from "lru-cache";
import { eachDayInRange } from "../book-analytics/dateRange.js";
import { err, ok } from "../../lib/result.js";
import { getAscConfig } from "./config.js";
import { resolveAscDateRange } from "./dateRange.js";
import {
  fetchDailySalesReport,
  summarizeDownloadsByCountry,
  summarizeDownloadsForApp
} from "./reports.js";
const cache = new LRUCache({
  max: 50,
  ttl: 1e3 * 60 * 15
});
function cacheKey(range, appId) {
  return `${appId}|${range.startDate}|${range.endDate}`;
}
function dateRangeFromAscRange(range) {
  return {
    from: /* @__PURE__ */ new Date(`${range.startDate}T00:00:00.000Z`),
    to: /* @__PURE__ */ new Date(`${range.endDate}T00:00:00.000Z`)
  };
}
function emptyCounts() {
  return { downloads: 0, firstTimeDownloads: 0, redownloads: 0 };
}
function addCounts(total, next) {
  return {
    downloads: total.downloads + next.downloads,
    firstTimeDownloads: total.firstTimeDownloads + next.firstTimeDownloads,
    redownloads: total.redownloads + next.redownloads
  };
}
function buildDashboardFromDailyPoints(range, points, topCountries = []) {
  const overview = points.reduce(
    (total, point) => addCounts(total, {
      downloads: point.downloads,
      firstTimeDownloads: point.firstTimeDownloads,
      redownloads: point.redownloads
    }),
    emptyCounts()
  );
  return {
    usesDefaultRange: range.usesDefaultRange,
    overview,
    dailyTrend: points,
    topCountries
  };
}
async function fetchDashboardData(config, range) {
  const days = eachDayInRange(dateRangeFromAscRange(range));
  const dailyTrend = [];
  const countryTotals = /* @__PURE__ */ new Map();
  for (const date of days) {
    const rows = await fetchDailySalesReport(config, date);
    const counts = rows === null ? emptyCounts() : summarizeDownloadsForApp(rows, config.appId);
    const countryRows = rows === null ? [] : summarizeDownloadsByCountry(rows, config.appId);
    dailyTrend.push({
      date,
      downloads: counts.downloads,
      firstTimeDownloads: counts.firstTimeDownloads,
      redownloads: counts.redownloads
    });
    for (const row of countryRows) {
      const entry = countryTotals.get(row.countryCode) ?? {
        countryCode: row.countryCode,
        downloads: 0,
        firstTimeDownloads: 0,
        redownloads: 0
      };
      entry.downloads += row.downloads;
      entry.firstTimeDownloads += row.firstTimeDownloads;
      entry.redownloads += row.redownloads;
      countryTotals.set(row.countryCode, entry);
    }
  }
  const topCountries = [...countryTotals.values()].sort((a, b) => {
    if (b.downloads !== a.downloads) return b.downloads - a.downloads;
    return a.countryCode.localeCompare(b.countryCode);
  }).slice(0, 10);
  return { dailyTrend, topCountries };
}
function clearAppDownloadsCacheForTests() {
  cache.clear();
}
async function getAppDownloadsDashboard(dateRange) {
  const [configError, config] = getAscConfig();
  if (configError) return err(configError);
  const ascRange = resolveAscDateRange(dateRange);
  const key = cacheKey(ascRange, config.appId);
  const cached = cache.get(key);
  if (cached) return ok(cached);
  try {
    const { dailyTrend, topCountries } = await fetchDashboardData(
      config,
      ascRange
    );
    const dashboard = buildDashboardFromDailyPoints(
      ascRange,
      dailyTrend,
      topCountries
    );
    cache.set(key, dashboard);
    return ok(dashboard);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load App Store Connect download data";
    return err({ reason: message });
  }
}
const appDownloadsParsers = {
  summarizeDownloadsForApp,
  summarizeDownloadsByCountry,
  buildDashboardFromDailyPoints
};
export {
  appDownloadsParsers,
  buildDashboardFromDailyPoints,
  clearAppDownloadsCacheForTests,
  getAppDownloadsDashboard
};
