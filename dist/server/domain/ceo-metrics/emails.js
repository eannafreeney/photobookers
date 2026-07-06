import { formatAnalyticsDateRangeLabel } from "../../features/book-analytics/dateRange.js";
import { analyticsSearchParams } from "../../features/book-analytics/dateRange.js";
const SITE_URL = process.env.SITE_URL ?? "https://photobookers.com";
const ADMIN_ANALYTICS_PATH = "/dashboard/admin/analytics";
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function metricRow(label, value, deltaLabel) {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #e8e4df;">
      <div style="font-size:13px;color:#5c574f;">${escapeHtml(label)}</div>
      <div style="font-size:28px;font-weight:600;color:#191613;">${value.toLocaleString()}</div>
      <div style="font-size:12px;color:#5c574f;margin-top:4px;">${escapeHtml(deltaLabel)}</div>
    </td>
  </tr>`;
}
function snapshotRow(label, value) {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #e8e4df;">
      <span style="font-size:13px;color:#5c574f;">${escapeHtml(label)}</span>
      <strong style="font-size:16px;color:#191613;margin-left:8px;">${value.toLocaleString()}</strong>
    </td>
  </tr>`;
}
function ceoMetricsEmailSubject(rangeLabel) {
  return `Photobookers weekly metrics \u2014 ${rangeLabel}`;
}
function buildCeoMetricsEmail(snapshot) {
  const rangeLabel = formatAnalyticsDateRangeLabel(snapshot.range);
  const previousLabel = formatAnalyticsDateRangeLabel(snapshot.previousRange);
  const analyticsUrl = `${SITE_URL}${ADMIN_ANALYTICS_PATH}${analyticsSearchParams(snapshot.range, { tab: "overview" })}`;
  const { breakdown } = snapshot.editorialActions;
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f6f3ef;font-family:Georgia,serif;color:#191613;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e4df;border-radius:8px;padding:24px;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8a5a44;">CEO metrics</p>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:500;">Weekly snapshot</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#5c574f;">${escapeHtml(rangeLabel)} \xB7 compared to ${escapeHtml(previousLabel)}</p>
    <table style="width:100%;border-collapse:collapse;">
      ${metricRow(
    "Weekly active collectors",
    snapshot.weeklyActiveCollectors.value,
    snapshot.weeklyActiveCollectors.delta.label
  )}
      ${metricRow(
    "Editorial-attributed actions",
    snapshot.editorialActions.value,
    snapshot.editorialActions.delta.label
  )}
      <tr>
        <td style="padding:8px 0 16px;font-size:12px;color:#5c574f;line-height:1.6;">
          ${breakdown.views.toLocaleString()} editorial views \xB7
          ${breakdown.clicks.toLocaleString()} editorial clicks \xB7
          ${breakdown.featuredWishlists.toLocaleString()} featured-book wishlists \xB7
          ${breakdown.featuredFollows.toLocaleString()} spotlight follows
        </td>
      </tr>
      <tr>
        <td style="padding:16px 0 8px;font-size:13px;font-weight:600;color:#191613;">Supply health</td>
      </tr>
      ${snapshotRow("Discoverable books", snapshot.supplyHealth.discoverableBooks)}
      ${snapshotRow("Active creators", snapshot.supplyHealth.activeCreators)}
      ${metricRow(
    "New discoverable releases",
    snapshot.supplyHealth.newReleases.value,
    snapshot.supplyHealth.newReleases.delta.label
  )}
    </table>
    <p style="margin:24px 0 0;font-size:14px;">
      <a href="${analyticsUrl}" style="color:#8a5a44;">Open dashboard</a>
    </p>
  </div>
</body>
</html>`;
}
export {
  buildCeoMetricsEmail,
  ceoMetricsEmailSubject
};
