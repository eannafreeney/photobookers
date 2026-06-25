import { afterEach, describe, expect, it, vi } from "vitest";
import { presetAnalyticsDateRange } from "../book-analytics/dateRange";
import {
  appDownloadsParsers,
  buildDashboardFromDailyPoints,
} from "./appDownloads";
import { getAscConfig } from "./config";
import { resolveAscDateRange } from "./dateRange";
import {
  parseSalesReportTsv,
  summarizeDownloadsByCountry,
  summarizeDownloadsForApp,
} from "./reports";

describe("resolveAscDateRange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to the last 30 days when date range is null", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const range = resolveAscDateRange(null);
    expect(range.usesDefaultRange).toBe(true);
    expect(range.startDate).toBe("2026-05-21");
    expect(range.endDate).toBe("2026-06-19");
  });

  it("maps an explicit analytics range to date strings", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const input = presetAnalyticsDateRange(7);
    const range = resolveAscDateRange(input);
    expect(range.usesDefaultRange).toBe(false);
    expect(range.startDate).toBe("2026-06-13");
    expect(range.endDate).toBe("2026-06-19");
  });
});

describe("getAscConfig", () => {
  const original = {
    keyId: process.env.ASC_KEY_ID,
    issuerId: process.env.ASC_ISSUER_ID,
    privateKey: process.env.ASC_PRIVATE_KEY,
    vendorNumber: process.env.ASC_VENDOR_NUMBER,
    appId: process.env.ASC_APP_ID,
  };

  afterEach(() => {
    process.env.ASC_KEY_ID = original.keyId;
    process.env.ASC_ISSUER_ID = original.issuerId;
    process.env.ASC_PRIVATE_KEY = original.privateKey;
    process.env.ASC_VENDOR_NUMBER = original.vendorNumber;
    process.env.ASC_APP_ID = original.appId;
  });

  it("returns an error when env vars are missing", () => {
    delete process.env.ASC_KEY_ID;
    delete process.env.ASC_ISSUER_ID;
    delete process.env.ASC_PRIVATE_KEY;
    delete process.env.ASC_VENDOR_NUMBER;

    const [error, config] = getAscConfig();
    expect(error?.reason).toBe("App Store Connect is not configured");
    expect(config).toBeNull();
  });

  it("parses valid env vars", () => {
    process.env.ASC_KEY_ID = "ABC123DEFG";
    process.env.ASC_ISSUER_ID = "6053b7fe-68a8-4acb-89be-165aa6465141";
    process.env.ASC_PRIVATE_KEY =
      "-----BEGIN PRIVATE KEY-----\\nline\\n-----END PRIVATE KEY-----";
    process.env.ASC_VENDOR_NUMBER = "12345678";
    process.env.ASC_APP_ID = "6771879476";

    const [error, config] = getAscConfig();
    expect(error).toBeNull();
    expect(config?.keyId).toBe("ABC123DEFG");
    expect(config?.vendorNumber).toBe("12345678");
    expect(config?.appId).toBe("6771879476");
    expect(config?.privateKey).toContain("\n");
  });
});

describe("parseSalesReportTsv", () => {
  it("parses download rows from a sales summary report", () => {
    const tsv = [
      "Provider\tProvider Country\tSKU\tDeveloper\tTitle\tVersion\tProduct Type Identifier\tUnits\tDeveloper Proceeds\tBegin Date\tEnd Date\tCustomer Currency\tCountry Code\tCurrency of Proceeds\tApple Identifier\tCustomer Price\tPromo Code\tParent Identifier\tSubscription\tPeriod\tCategory\tCMB\tDevice\tSupported Platforms\tProceeds Reason\tPreserved Pricing\tClient\tOrder Type",
      "APPLE\tUS\tskubook\tDev\tPhotobookers\t1.0\t1F\t3\t0.00\t06/18/2026\t06/18/2026\tUSD\tUS\tUSD\t6771879476\t0.00\t\t\t\t\t\t\t\t\t\t\t",
      "APPLE\tUS\tskubook\tDev\tPhotobookers\t1.0\t3F\t1\t0.00\t06/18/2026\t06/18/2026\tUSD\tUS\tUSD\t6771879476\t0.00\t\t\t\t\t\t\t\t\t\t\t",
      "APPLE\tUS\tskubook\tDev\tPhotobookers\t1.0\t7\t5\t0.00\t06/18/2026\t06/18/2026\tUSD\tUS\tUSD\t6771879476\t0.00\t\t\t\t\t\t\t\t\t\t\t",
    ].join("\n");

    const rows = parseSalesReportTsv(tsv);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.productType).toBe("1F");
    expect(rows[0]?.units).toBe(3);
    expect(rows[0]?.countryCode).toBe("US");
  });
});

describe("summarizeDownloadsForApp", () => {
  it("counts first-time and redownload units for the target app", () => {
    const rows = parseSalesReportTsv(
      [
        "Provider\tProvider Country\tSKU\tDeveloper\tTitle\tVersion\tProduct Type Identifier\tUnits\tDeveloper Proceeds\tBegin Date\tEnd Date\tCustomer Currency\tCountry Code\tCurrency of Proceeds\tApple Identifier\tCustomer Price\tPromo Code\tParent Identifier\tSubscription\tPeriod\tCategory\tCMB\tDevice\tSupported Platforms\tProceeds Reason\tPreserved Pricing\tClient\tOrder Type",
        "APPLE\tUS\tskubook\tDev\tPhotobookers\t1.0\t1F\t3\t0.00\t06/18/2026\t06/18/2026\tUSD\tUS\tUSD\t6771879476\t0.00\t\t\t\t\t\t\t\t\t\t\t",
        "APPLE\tUS\tskubook\tDev\tPhotobookers\t1.0\t3F\t1\t0.00\t06/18/2026\t06/18/2026\tUSD\tUS\tUSD\t6771879476\t0.00\t\t\t\t\t\t\t\t\t\t\t",
        "APPLE\tUS\tother\tDev\tOther\t1.0\t1F\t9\t0.00\t06/18/2026\t06/18/2026\tUSD\tUS\tUSD\t1111111111\t0.00\t\t\t\t\t\t\t\t\t\t\t",
      ].join("\n"),
    );

    const summary = summarizeDownloadsForApp(rows, "6771879476");
    expect(summary).toEqual({
      downloads: 4,
      firstTimeDownloads: 3,
      redownloads: 1,
    });
  });
});

describe("summarizeDownloadsByCountry", () => {
  it("groups download units by country for the target app", () => {
    const rows = parseSalesReportTsv(
      [
        "Provider\tProvider Country\tSKU\tDeveloper\tTitle\tVersion\tProduct Type Identifier\tUnits\tDeveloper Proceeds\tBegin Date\tEnd Date\tCustomer Currency\tCountry Code\tCurrency of Proceeds\tApple Identifier\tCustomer Price\tPromo Code\tParent Identifier\tSubscription\tPeriod\tCategory\tCMB\tDevice\tSupported Platforms\tProceeds Reason\tPreserved Pricing\tClient\tOrder Type",
        "APPLE\tUS\tskubook\tDev\tPhotobookers\t1.0\t1F\t3\t0.00\t06/18/2026\t06/18/2026\tUSD\tUS\tUSD\t6771879476\t0.00\t\t\t\t\t\t\t\t\t\t\t",
        "APPLE\tUS\tskubook\tDev\tPhotobookers\t1.0\t3F\t1\t0.00\t06/18/2026\t06/18/2026\tUSD\tUS\tUSD\t6771879476\t0.00\t\t\t\t\t\t\t\t\t\t\t",
        "APPLE\tGB\tskubook\tDev\tPhotobookers\t1.0\t1F\t2\t0.00\t06/18/2026\t06/18/2026\tGBP\tGB\tGBP\t6771879476\t0.00\t\t\t\t\t\t\t\t\t\t\t",
        "APPLE\tUS\tother\tDev\tOther\t1.0\t1F\t9\t0.00\t06/18/2026\t06/18/2026\tUSD\tCA\tUSD\t1111111111\t0.00\t\t\t\t\t\t\t\t\t\t\t",
      ].join("\n"),
    );

    expect(summarizeDownloadsByCountry(rows, "6771879476")).toEqual([
      {
        countryCode: "US",
        downloads: 4,
        firstTimeDownloads: 3,
        redownloads: 1,
      },
      {
        countryCode: "GB",
        downloads: 2,
        firstTimeDownloads: 2,
        redownloads: 0,
      },
    ]);
  });
});

describe("buildDashboardFromDailyPoints", () => {
  it("aggregates overview totals from daily points", () => {
    const dashboard = buildDashboardFromDailyPoints(
      {
        startDate: "2026-06-18",
        endDate: "2026-06-19",
        usesDefaultRange: false,
      },
      [
        {
          date: "2026-06-18",
          downloads: 4,
          firstTimeDownloads: 3,
          redownloads: 1,
        },
        {
          date: "2026-06-19",
          downloads: 2,
          firstTimeDownloads: 2,
          redownloads: 0,
        },
      ],
    );

    expect(dashboard.overview).toEqual({
      downloads: 6,
      firstTimeDownloads: 5,
      redownloads: 1,
    });
    expect(dashboard.dailyTrend).toHaveLength(2);
    expect(dashboard.topCountries).toEqual([]);
  });

  it("re-exports summarizeDownloadsForApp for parser tests", () => {
    expect(appDownloadsParsers.summarizeDownloadsForApp).toBe(
      summarizeDownloadsForApp,
    );
  });

  it("re-exports summarizeDownloadsByCountry for parser tests", () => {
    expect(appDownloadsParsers.summarizeDownloadsByCountry).toBe(
      summarizeDownloadsByCountry,
    );
  });
});
