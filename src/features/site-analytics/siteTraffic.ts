import { LRUCache } from "lru-cache";
import type { AnalyticsDateRange } from "../book-analytics/dateRange";
import { err, ok, type Result } from "../../lib/result";
import { getGa4Client } from "./client";
import { getGa4Config } from "./config";
import { resolveGa4DateRange } from "./dateRange";
import { formatGaDate } from "./format";
import {
  dimensionValue,
  metricValue,
  reportRows,
} from "./parseReport";
import { runSiteTrafficReports } from "./reports";

export type SiteTrafficOverview = {
  sessions: number;
  totalUsers: number;
  newUsers: number;
  engagementRate: number | null;
  averageSessionDuration: number;
};

export type DailyTrafficPoint = {
  date: string;
  sessions: number;
  totalUsers: number;
};

export type AcquisitionRow = {
  channelGroup: string;
  source: string;
  medium: string;
  sessions: number;
  totalUsers: number;
};

export type ReferrerRow = {
  source: string;
  sessions: number;
  totalUsers: number;
};

export type LandingPageRow = {
  landingPage: string;
  sessions: number;
  engagedSessions: number;
  engagementRate: number | null;
};

export type TopPageRow = {
  pagePath: string;
  screenPageViews: number;
  sessions: number;
};

export type GeographyRow = {
  country: string;
  sessions: number;
  totalUsers: number;
};

export type DeviceBreakdown = {
  mobile: number;
  desktop: number;
  tablet: number;
};

export type CampaignRow = {
  campaign: string;
  source: string;
  medium: string;
  sessions: number;
  totalUsers: number;
};

export type SiteTrafficDashboard = {
  usesDefaultRange: boolean;
  overview: SiteTrafficOverview;
  dailyTrend: DailyTrafficPoint[];
  acquisition: AcquisitionRow[];
  referrers: ReferrerRow[];
  landingPages: LandingPageRow[];
  topPages: TopPageRow[];
  geography: GeographyRow[];
  devices: DeviceBreakdown;
  campaigns: CampaignRow[];
};

const cache = new LRUCache<string, SiteTrafficDashboard>({
  max: 50,
  ttl: 1000 * 60 * 5,
});

function cacheKey(range: Ga4DateRangeKey): string {
  return `${range.startDate}|${range.endDate}`;
}

type Ga4DateRangeKey = ReturnType<typeof resolveGa4DateRange>;

function parseOverview(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["overview"],
): SiteTrafficOverview {
  const row = reportRows(report)[0];
  const engagementRate = metricValue(row, 3);
  return {
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1),
    newUsers: metricValue(row, 2),
    engagementRate: row ? engagementRate : null,
    averageSessionDuration: metricValue(row, 4),
  };
}

function parseDailyTrend(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["dailyTrend"],
): DailyTrafficPoint[] {
  return reportRows(report).map((row) => ({
    date: formatGaDate(dimensionValue(row, 0)),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1),
  }));
}

function parseAcquisition(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["acquisition"],
): AcquisitionRow[] {
  return reportRows(report).map((row) => ({
    channelGroup: dimensionValue(row, 0),
    source: dimensionValue(row, 1),
    medium: dimensionValue(row, 2),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1),
  }));
}

function parseReferrers(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["referrers"],
): ReferrerRow[] {
  return reportRows(report).map((row) => ({
    source: dimensionValue(row, 0),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1),
  }));
}

function parseLandingPages(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["landingPages"],
): LandingPageRow[] {
  return reportRows(report).map((row) => ({
    landingPage: dimensionValue(row, 0),
    sessions: metricValue(row, 0),
    engagedSessions: metricValue(row, 1),
    engagementRate: metricValue(row, 2),
  }));
}

function parseTopPages(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["topPages"],
): TopPageRow[] {
  return reportRows(report).map((row) => ({
    pagePath: dimensionValue(row, 0),
    screenPageViews: metricValue(row, 0),
    sessions: metricValue(row, 1),
  }));
}

function parseGeography(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["geography"],
): GeographyRow[] {
  return reportRows(report).map((row) => ({
    country: dimensionValue(row, 0),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1),
  }));
}

function parseDevices(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["devices"],
): DeviceBreakdown {
  const breakdown: DeviceBreakdown = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
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

function parseCampaigns(
  report: Awaited<ReturnType<typeof runSiteTrafficReports>>["campaigns"],
): CampaignRow[] {
  return reportRows(report).map((row) => ({
    campaign: dimensionValue(row, 0),
    source: dimensionValue(row, 1),
    medium: dimensionValue(row, 2),
    sessions: metricValue(row, 0),
    totalUsers: metricValue(row, 1),
  }));
}

function buildDashboard(
  gaRange: Ga4DateRangeKey,
  reports: Awaited<ReturnType<typeof runSiteTrafficReports>>,
): SiteTrafficDashboard {
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
    campaigns: parseCampaigns(reports.campaigns),
  };
}

export function clearSiteTrafficCacheForTests(): void {
  cache.clear();
}

export async function getSiteTrafficDashboard(
  dateRange: AnalyticsDateRange | null,
): Promise<Result<SiteTrafficDashboard, { reason: string }>> {
  const [configError, config] = getGa4Config();
  if (configError) return err(configError);

  const gaRange = resolveGa4DateRange(dateRange);
  const key = cacheKey(gaRange);
  const cached = cache.get(key);
  if (cached) return ok(cached);

  try {
    const client = getGa4Client(config.credentials);
    const reports = await runSiteTrafficReports(
      client,
      config.propertyId,
      gaRange,
    );
    const dashboard = buildDashboard(gaRange, reports);
    cache.set(key, dashboard);
    return ok(dashboard);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Google Analytics data";
    return err({ reason: message });
  }
}

// Exported for unit tests
export const siteTrafficParsers = {
  parseOverview,
  parseDailyTrend,
  parseAcquisition,
  parseReferrers,
  parseLandingPages,
  parseTopPages,
  parseGeography,
  parseDevices,
  parseCampaigns,
  buildDashboard,
};
