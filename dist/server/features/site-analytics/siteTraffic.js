import { LRUCache } from "lru-cache";
import { err, ok } from "../../lib/result.js";
import { getGa4Client } from "./client.js";
import { getGa4Config } from "./config.js";
import { resolveGa4DateRange } from "./dateRange.js";
import { formatGaDate } from "./format.js";
import {
  dimensionValue,
  metricValue,
  reportRows
} from "./parseReport.js";
import { runSiteTrafficReports } from "./reports.js";
const cache = new LRUCache({
  max: 50,
  ttl: 1e3 * 60 * 5
});
function cacheKey(range) {
  return `${range.startDate}|${range.endDate}`;
}
function parseOverview(report) {
  const row = reportRows(report)[0];
  const engagementRate = metricValue(row, 3);
  return {
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1),
    newUsers: metricValue(row, 2),
    engagementRate: row ? engagementRate : null,
    averageSessionDuration: metricValue(row, 4)
  };
}
function parseDailyTrend(report) {
  return reportRows(report).map((row) => ({
    date: formatGaDate(dimensionValue(row, 0)),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1)
  }));
}
function parseAcquisition(report) {
  return reportRows(report).map((row) => ({
    channelGroup: dimensionValue(row, 0),
    source: dimensionValue(row, 1),
    medium: dimensionValue(row, 2),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1)
  }));
}
function parseReferrers(report) {
  return reportRows(report).map((row) => ({
    source: dimensionValue(row, 0),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1)
  }));
}
function parseLandingPages(report) {
  return reportRows(report).map((row) => ({
    landingPage: dimensionValue(row, 0),
    sessions: metricValue(row, 0),
    engagedSessions: metricValue(row, 1),
    engagementRate: metricValue(row, 2)
  }));
}
function parseTopPages(report) {
  return reportRows(report).map((row) => ({
    pagePath: dimensionValue(row, 0),
    screenPageViews: metricValue(row, 0),
    sessions: metricValue(row, 1)
  }));
}
function parseGeography(report) {
  return reportRows(report).map((row) => ({
    country: dimensionValue(row, 0),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1)
  }));
}
function parseDevices(report) {
  const breakdown = {
    mobile: 0,
    desktop: 0,
    tablet: 0
  };
  for (const row of reportRows(report)) {
    const category = dimensionValue(row, 0).toLowerCase();
    const sessions = metricValue(row, 0);
    if (category === "mobile") breakdown.mobile = sessions;
    else if (category === "desktop") breakdown.desktop = sessions;
    else if (category === "tablet") breakdown.tablet = sessions;
  }
  return breakdown;
}
function parseCampaigns(report) {
  return reportRows(report).map((row) => ({
    campaign: dimensionValue(row, 0),
    source: dimensionValue(row, 1),
    medium: dimensionValue(row, 2),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1)
  }));
}
function buildDashboard(gaRange, reports) {
  return {
    usesDefaultRange: gaRange.usesDefaultRange,
    overview: parseOverview(reports.overview),
    dailyTrend: parseDailyTrend(reports.dailyTrend),
    acquisition: parseAcquisition(reports.acquisition),
    referrers: parseReferrers(reports.referrers),
    landingPages: parseLandingPages(reports.landingPages),
    topPages: parseTopPages(reports.topPages),
    geography: parseGeography(reports.geography),
    devices: parseDevices(reports.devices),
    campaigns: parseCampaigns(reports.campaigns)
  };
}
function clearSiteTrafficCacheForTests() {
  cache.clear();
}
async function getSiteTrafficDashboard(dateRange) {
  const [configError, config] = getGa4Config();
  if (configError) return err(configError);
  const gaRange = resolveGa4DateRange(dateRange);
  const key = cacheKey(gaRange);
  const cached = cache.get(key);
  if (cached) return ok(cached);
  try {
    const client = await getGa4Client(config.credentials);
    const reports = await runSiteTrafficReports(
      client,
      config.propertyId,
      gaRange
    );
    const dashboard = buildDashboard(gaRange, reports);
    cache.set(key, dashboard);
    return ok(dashboard);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Google Analytics data";
    return err({ reason: message });
  }
}
const siteTrafficParsers = {
  parseOverview,
  parseDailyTrend,
  parseAcquisition,
  parseReferrers,
  parseLandingPages,
  parseTopPages,
  parseGeography,
  parseDevices,
  parseCampaigns,
  buildDashboard
};
export {
  clearSiteTrafficCacheForTests,
  getSiteTrafficDashboard,
  siteTrafficParsers
};
