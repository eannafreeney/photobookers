import type { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { google } from "@google-analytics/data/build/protos/protos";
import type { Ga4DateRange } from "./dateRange";

type RunReportRequest = google.analytics.data.v1beta.IRunReportRequest;

const TABLE_LIMIT = 10;

function dateRanges(range: Ga4DateRange) {
  return [{ startDate: range.startDate, endDate: range.endDate }];
}

function metric(name: string) {
  return { name };
}

function dimension(name: string) {
  return { name };
}

function overviewRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    metrics: [
      metric("sessions"),
      metric("totalUsers"),
      metric("newUsers"),
      metric("engagementRate"),
      metric("averageSessionDuration"),
    ],
  };
}

function dailyTrendRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("date")],
    metrics: [metric("sessions"), metric("totalUsers")],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  };
}

function acquisitionRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    dimensions: [
      dimension("sessionDefaultChannelGroup"),
      dimension("sessionSource"),
      dimension("sessionMedium"),
    ],
    metrics: [metric("sessions"), metric("totalUsers")],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT,
  };
}

function referrersRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("sessionSource")],
    metrics: [metric("sessions"), metric("totalUsers")],
    dimensionFilter: {
      filter: {
        fieldName: "sessionMedium",
        stringFilter: { matchType: "EXACT", value: "referral" },
      },
    },
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT,
  };
}

function landingPagesRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("landingPagePlusQueryString")],
    metrics: [
      metric("sessions"),
      metric("engagedSessions"),
      metric("engagementRate"),
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT,
  };
}

function topPagesRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("pagePath")],
    metrics: [metric("screenPageViews"), metric("sessions")],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: TABLE_LIMIT,
  };
}

function geographyRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("country")],
    metrics: [metric("sessions"), metric("totalUsers")],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT,
  };
}

function devicesRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("deviceCategory")],
    metrics: [metric("sessions")],
  };
}

function campaignsRequest(range: Ga4DateRange): RunReportRequest {
  return {
    dateRanges: dateRanges(range),
    dimensions: [
      dimension("sessionCampaignName"),
      dimension("sessionSource"),
      dimension("sessionMedium"),
    ],
    metrics: [metric("sessions"), metric("totalUsers")],
    dimensionFilter: {
      notExpression: {
        filter: {
          fieldName: "sessionCampaignName",
          stringFilter: { matchType: "EXACT", value: "(not set)" },
        },
      },
    },
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT,
  };
}

export async function runSiteTrafficReports(
  client: BetaAnalyticsDataClient,
  propertyId: string,
  range: Ga4DateRange,
) {
  const property = `properties/${propertyId}`;

  const [batch1] = await client.batchRunReports({
    property,
    requests: [
      overviewRequest(range),
      dailyTrendRequest(range),
      acquisitionRequest(range),
      referrersRequest(range),
      landingPagesRequest(range),
    ],
  });

  const [batch2] = await client.batchRunReports({
    property,
    requests: [
      topPagesRequest(range),
      geographyRequest(range),
      devicesRequest(range),
      campaignsRequest(range),
    ],
  });

  const reports1 = batch1.reports ?? [];
  const reports2 = batch2.reports ?? [];

  return {
    overview: reports1[0],
    dailyTrend: reports1[1],
    acquisition: reports1[2],
    referrers: reports1[3],
    landingPages: reports1[4],
    topPages: reports2[0],
    geography: reports2[1],
    devices: reports2[2],
    campaigns: reports2[3],
  };
}
