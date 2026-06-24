import { afterEach, describe, expect, it, vi } from "vitest";
import { presetAnalyticsDateRange } from "../book-analytics/dateRange";
import { getGa4Config } from "./config";
import { resolveGa4DateRange } from "./dateRange";
import { formatEngagementRate, formatGaDate } from "./format";
import {
  clearSiteTrafficCacheForTests,
  getSiteTrafficDashboard,
  siteTrafficParsers,
} from "./siteTraffic";

describe("resolveGa4DateRange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to the last 90 days when date range is null", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const range = resolveGa4DateRange(null);
    expect(range.usesDefaultRange).toBe(true);
    expect(range.startDate).toBe("2026-03-22");
    expect(range.endDate).toBe("2026-06-19");
  });

  it("maps an explicit analytics range to GA4 date strings", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const input = presetAnalyticsDateRange(7);
    const range = resolveGa4DateRange(input);
    expect(range.usesDefaultRange).toBe(false);
    expect(range.startDate).toBe("2026-06-13");
    expect(range.endDate).toBe("2026-06-19");
  });
});

describe("getGa4Config", () => {
  const originalPropertyId = process.env.GA4_PROPERTY_ID;
  const originalJson = process.env.GA4_SERVICE_ACCOUNT_JSON;

  afterEach(() => {
    process.env.GA4_PROPERTY_ID = originalPropertyId;
    process.env.GA4_SERVICE_ACCOUNT_JSON = originalJson;
  });

  it("returns an error when env vars are missing", () => {
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GA4_SERVICE_ACCOUNT_JSON;

    const [error, config] = getGa4Config();
    expect(error?.reason).toBe("Google Analytics is not configured");
    expect(config).toBeNull();
  });

  it("returns an error for invalid JSON", () => {
    process.env.GA4_PROPERTY_ID = "123456789";
    process.env.GA4_SERVICE_ACCOUNT_JSON = "not-json";

    const [error] = getGa4Config();
    expect(error?.reason).toBe("GA4_SERVICE_ACCOUNT_JSON is invalid JSON");
  });

  it("parses valid service account JSON", () => {
    process.env.GA4_PROPERTY_ID = "123456789";
    process.env.GA4_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: "ga@test.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    });

    const [error, config] = getGa4Config();
    expect(error).toBeNull();
    expect(config?.propertyId).toBe("123456789");
    expect(config?.credentials.client_email).toBe("ga@test.iam.gserviceaccount.com");
  });
});

describe("siteTrafficParsers", () => {
  it("parses overview metrics from a GA4 row", () => {
    const overview = siteTrafficParsers.parseOverview({
      rows: [
        {
          metricValues: [
            { value: "120" },
            { value: "95" },
            { value: "40" },
            { value: "0.62" },
            { value: "142.5" },
          ],
        },
      ],
    });

    expect(overview).toEqual({
      sessions: 120,
      totalUsers: 95,
      newUsers: 40,
      engagementRate: 0.62,
      averageSessionDuration: 142.5,
    });
  });

  it("parses daily trend rows with GA date formatting", () => {
    const points = siteTrafficParsers.parseDailyTrend({
      rows: [
        {
          dimensionValues: [{ value: "20260618" }],
          metricValues: [{ value: "10" }, { value: "8" }],
        },
      ],
    });

    expect(points).toEqual([
      { date: "2026-06-18", sessions: 10, totalUsers: 8 },
    ]);
    expect(formatGaDate("20260618")).toBe("2026-06-18");
    expect(formatEngagementRate(0.625)).toBe("62.5%");
  });

  it("maps device categories into a fixed breakdown", () => {
    const devices = siteTrafficParsers.parseDevices({
      rows: [
        {
          dimensionValues: [{ value: "mobile" }],
          metricValues: [{ value: "50" }],
        },
        {
          dimensionValues: [{ value: "desktop" }],
          metricValues: [{ value: "30" }],
        },
        {
          dimensionValues: [{ value: "tablet" }],
          metricValues: [{ value: "5" }],
        },
      ],
    });

    expect(devices).toEqual({ mobile: 50, desktop: 30, tablet: 5 });
  });
});

describe("getSiteTrafficDashboard", () => {
  const originalPropertyId = process.env.GA4_PROPERTY_ID;
  const originalJson = process.env.GA4_SERVICE_ACCOUNT_JSON;

  afterEach(() => {
    process.env.GA4_PROPERTY_ID = originalPropertyId;
    process.env.GA4_SERVICE_ACCOUNT_JSON = originalJson;
    clearSiteTrafficCacheForTests();
    vi.restoreAllMocks();
  });

  it("returns a configured error without calling the GA4 API", async () => {
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GA4_SERVICE_ACCOUNT_JSON;

    const [error, data] = await getSiteTrafficDashboard(null);
    expect(error?.reason).toBe("Google Analytics is not configured");
    expect(data).toBeNull();
  });

  it("assembles a dashboard from mocked GA4 batch responses", async () => {
    process.env.GA4_PROPERTY_ID = "123456789";
    process.env.GA4_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: "ga@test.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
    });

    const batchRunReports = vi
      .fn()
      .mockResolvedValueOnce([
        {
          reports: [
            {
              rows: [
                {
                  metricValues: [
                    { value: "10" },
                    { value: "8" },
                    { value: "3" },
                    { value: "0.5" },
                    { value: "60" },
                  ],
                },
              ],
            },
            { rows: [] },
            { rows: [] },
            { rows: [] },
            { rows: [] },
          ],
        },
      ])
      .mockResolvedValueOnce([
        {
          reports: [{ rows: [] }, { rows: [] }, { rows: [] }, { rows: [] }],
        },
      ]);

    vi.doMock("@google-analytics/data", () => ({
      BetaAnalyticsDataClient: vi.fn().mockImplementation(() => ({
        batchRunReports,
      })),
    }));

    vi.resetModules();
    const { getSiteTrafficDashboard: loadDashboard, clearSiteTrafficCacheForTests: clearCache } =
      await import("./siteTraffic");

    clearCache();
    const [error, data] = await loadDashboard(presetAnalyticsDateRange(7));

    expect(error).toBeNull();
    expect(data?.overview.sessions).toBe(10);
    expect(batchRunReports).toHaveBeenCalledTimes(2);
  });
});
