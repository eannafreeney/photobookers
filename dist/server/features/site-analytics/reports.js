const TABLE_LIMIT = 10;
function dateRanges(range) {
  return [{ startDate: range.startDate, endDate: range.endDate }];
}
function metric(name) {
  return { name };
}
function dimension(name) {
  return { name };
}
function overviewRequest(range) {
  return {
    dateRanges: dateRanges(range),
    metrics: [
      metric("sessions"),
      metric("totalUsers"),
      metric("newUsers"),
      metric("engagementRate"),
      metric("averageSessionDuration")
    ]
  };
}
function dailyTrendRequest(range) {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("date")],
    metrics: [metric("sessions"), metric("totalUsers")],
    orderBys: [{ dimension: { dimensionName: "date" } }]
  };
}
function acquisitionRequest(range) {
  return {
    dateRanges: dateRanges(range),
    dimensions: [
      dimension("sessionDefaultChannelGroup"),
      dimension("sessionSource"),
      dimension("sessionMedium")
    ],
    metrics: [metric("sessions"), metric("totalUsers")],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT
  };
}
function referrersRequest(range) {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("sessionSource")],
    metrics: [metric("sessions"), metric("totalUsers")],
    dimensionFilter: {
      filter: {
        fieldName: "sessionMedium",
        stringFilter: { matchType: "EXACT", value: "referral" }
      }
    },
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT
  };
}
function landingPagesRequest(range) {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("landingPagePlusQueryString")],
    metrics: [
      metric("sessions"),
      metric("engagedSessions"),
      metric("engagementRate")
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT
  };
}
function topPagesRequest(range) {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("pagePath")],
    metrics: [metric("screenPageViews"), metric("sessions")],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: TABLE_LIMIT
  };
}
function geographyRequest(range) {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("country")],
    metrics: [metric("sessions"), metric("totalUsers")],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT
  };
}
function devicesRequest(range) {
  return {
    dateRanges: dateRanges(range),
    dimensions: [dimension("deviceCategory")],
    metrics: [metric("sessions")]
  };
}
function campaignsRequest(range) {
  return {
    dateRanges: dateRanges(range),
    dimensions: [
      dimension("sessionCampaignName"),
      dimension("sessionSource"),
      dimension("sessionMedium")
    ],
    metrics: [metric("sessions"), metric("totalUsers")],
    dimensionFilter: {
      notExpression: {
        filter: {
          fieldName: "sessionCampaignName",
          stringFilter: { matchType: "EXACT", value: "(not set)" }
        }
      }
    },
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: TABLE_LIMIT
  };
}
async function runSiteTrafficReports(client, propertyId, range) {
  const property = `properties/${propertyId}`;
  const [batch1] = await client.batchRunReports({
    property,
    requests: [
      overviewRequest(range),
      dailyTrendRequest(range),
      acquisitionRequest(range),
      referrersRequest(range),
      landingPagesRequest(range)
    ]
  });
  const [batch2] = await client.batchRunReports({
    property,
    requests: [
      topPagesRequest(range),
      geographyRequest(range),
      devicesRequest(range),
      campaignsRequest(range)
    ]
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
    campaigns: reports2[3]
  };
}
export {
  runSiteTrafficReports
};
