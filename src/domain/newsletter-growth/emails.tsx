import { analyticsSearchParams } from "../../features/book-analytics/dateRange";
import { formatAnalyticsDateRangeLabel } from "../../features/book-analytics/dateRange";
import { formatRatePercent, SIGNUP_TARGET_MAX, SIGNUP_TARGET_MIN } from "./format";
import type { NewsletterGrowthReport } from "./types";

const SITE_URL = process.env.SITE_URL ?? "https://photobookers.com";
const ADMIN_ANALYTICS_PATH = "/dashboard/admin/analytics";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function metricRow(label: string, value: string, hint: string): string {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #e8e4df;">
      <div style="font-size:13px;color:#5c574f;">${escapeHtml(label)}</div>
      <div style="font-size:28px;font-weight:600;color:#191613;">${escapeHtml(value)}</div>
      <div style="font-size:12px;color:#5c574f;margin-top:4px;">${escapeHtml(hint)}</div>
    </td>
  </tr>`;
}

function snapshotRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #e8e4df;">
      <span style="font-size:13px;color:#5c574f;">${escapeHtml(label)}</span>
      <strong style="font-size:16px;color:#191613;margin-left:8px;">${escapeHtml(value)}</strong>
    </td>
  </tr>`;
}

export function newsletterGrowthEmailSubject(report: NewsletterGrowthReport): string {
  const sign = report.signupsThisWeek >= 0 ? "+" : "";
  return `Photobookers list — ${report.totalSubscribers.toLocaleString()} subs · ${sign}${report.signupsThisWeek} this week`;
}

export function buildNewsletterGrowthEmail(report: NewsletterGrowthReport): string {
  const rangeLabel = formatAnalyticsDateRangeLabel(report.range);
  const previousLabel = formatAnalyticsDateRangeLabel(report.previousRange);
  const newsletterUrl = `${SITE_URL}${ADMIN_ANALYTICS_PATH}${analyticsSearchParams(report.range, { tab: "newsletter" })}`;
  const overviewUrl = `${SITE_URL}${ADMIN_ANALYTICS_PATH}${analyticsSearchParams(report.range, { tab: "overview" })}`;

  const campaignBlock = report.campaign
    ? `<p style="margin:16px 0 8px;font-size:13px;font-weight:600;color:#191613;">Last campaign</p>
    <table style="width:100%;border-collapse:collapse;">
      ${snapshotRow("Subject", report.campaign.subject)}
      ${snapshotRow("Delivered", report.campaign.delivered.toLocaleString())}
      ${snapshotRow("Unique open rate", formatRatePercent(report.campaign.openRate))}
      ${snapshotRow("Unique click rate", formatRatePercent(report.campaign.clickRate))}
      ${snapshotRow("Unsubscribes from this send", report.campaign.unsubscriptions.toLocaleString())}
    </table>
    <p style="margin:8px 0 0;font-size:12px;color:#5c574f;">Open/click rates are unique ÷ delivered. Email clicks are not the same as buy clicks.</p>`
    : `<p style="margin:16px 0 0;font-size:14px;color:#5c574f;">No sent Brevo campaign found.</p>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f6f3ef;font-family:Georgia,serif;color:#191613;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e4df;border-radius:8px;padding:24px;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8a5a44;">Book of the Day list</p>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:500;">Weekly scores</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#5c574f;">${escapeHtml(rangeLabel)} · vs ${escapeHtml(previousLabel)}</p>
    <table style="width:100%;border-collapse:collapse;">
      ${metricRow(
        "Total subscribers",
        report.totalSubscribers.toLocaleString(),
        "Compare this number to last Thursday’s email for true net list change.",
      )}
      ${metricRow(
        "New signups this week",
        report.signupsThisWeek.toLocaleString(),
        `${report.signupsDelta.label}. Aim ${SIGNUP_TARGET_MIN}–${SIGNUP_TARGET_MAX}. Gross adds, not minus unsubscribes.`,
      )}
    </table>
    ${campaignBlock}
    <p style="margin:24px 0 8px;font-size:13px;font-weight:600;color:#191613;">Site — did they try to buy?</p>
    <table style="width:100%;border-collapse:collapse;">
      ${snapshotRow("Editorial buy clicks", `${report.editorialBuyClicks.toLocaleString()} (${report.editorialBuyClicksDelta.label})`)}
      ${snapshotRow("Buy clicks from BOTD pages", report.botdPageBuyClicks.toLocaleString())}
      ${snapshotRow("Buy clicks on this week’s BOTD books", report.botdBookBuyClicks.toLocaleString())}
      ${snapshotRow("All buy clicks", report.allBuyClicks.toLocaleString())}
    </table>
    <p style="margin:12px 0 0;font-size:12px;color:#5c574f;line-height:1.6;">
      Newsletter mail usually has no referer, so we cannot split “buy from the Wednesday email” vs the rest of the site.
      BOTD-page clicks need the shop link on the pick page. BOTD-book clicks are the number to show a featured creator.
    </p>
    <p style="margin:24px 0 0;font-size:13px;">
      <a href="${escapeHtml(newsletterUrl)}" style="color:#a22c29;">Newsletter analytics</a>
      ·
      <a href="${escapeHtml(overviewUrl)}" style="color:#a22c29;">CEO overview</a>
    </p>
  </div>
</body>
</html>`;
}
