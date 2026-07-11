import {
  analyticsSearchParams,
  formatAnalyticsDateRangeLabel,
} from "../../features/book-analytics/dateRange";
import type {
  DailyProductDigestSnapshot,
  DailyProductDigestTopBook,
  DailyProductDigestTopCreator,
} from "./types";

const SITE_URL = process.env.SITE_URL ?? "https://photobookers.com";
const ADMIN_ANALYTICS_PATH = "/dashboard/admin/analytics";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statCell(label: string, value: number | null, unavailable = false): string {
  const display =
    unavailable || value === null ? "—" : value.toLocaleString();
  return `<td style="padding:12px;width:50%;vertical-align:top;border-bottom:1px solid #e8e4df;">
    <div style="font-size:12px;color:#5c574f;">${escapeHtml(label)}</div>
    <div style="font-size:24px;font-weight:600;color:#191613;margin-top:4px;">${display}</div>
  </td>`;
}

function rankedList(
  items: Array<{ label: string; href: string; count: number; detail?: string | null }>,
  emptyLabel: string,
): string {
  if (items.length === 0) {
    return `<p style="margin:0;font-size:13px;color:#5c574f;">${escapeHtml(emptyLabel)}</p>`;
  }

  return `<ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;">
    ${items
      .map(
        (item) => `<li style="margin-bottom:8px;">
      <a href="${escapeHtml(item.href)}" style="color:#8a5a44;text-decoration:none;">${escapeHtml(item.label)}</a>
      <span style="color:#5c574f;"> — ${item.count.toLocaleString()} views</span>
      ${item.detail ? `<span style="color:#8a857c;font-size:12px;"> (${escapeHtml(item.detail)})</span>` : ""}
    </li>`,
      )
      .join("")}
  </ol>`;
}

function bookDetail(book: DailyProductDigestTopBook): string | null {
  const parts = [book.artistName, book.publisherName].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function buildBookItems(books: DailyProductDigestTopBook[]) {
  return books.map((book) => ({
    label: book.title,
    href: `${SITE_URL}/books/${book.slug}`,
    count: book.viewCount,
    detail: bookDetail(book),
  }));
}

function buildCreatorItems(creators: DailyProductDigestTopCreator[]) {
  return creators.map((creator) => ({
    label: creator.displayName,
    href: `${SITE_URL}/creators/${creator.slug}`,
    count: creator.viewCount,
    detail: null,
  }));
}

export function dailyProductDigestEmailSubject(rangeLabel: string): string {
  return `Photobookers daily product digest — ${rangeLabel}`;
}

export function buildDailyProductDigestEmail(
  snapshot: DailyProductDigestSnapshot,
): string {
  const rangeLabel = formatAnalyticsDateRangeLabel(snapshot.range);
  const analyticsUrl = `${SITE_URL}${ADMIN_ANALYTICS_PATH}${analyticsSearchParams(snapshot.range, { tab: "books" })}`;
  const { growth } = snapshot;
  const newsletterUnavailable = growth.newsletterSignups === null;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f6f3ef;font-family:Georgia,serif;color:#191613;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e4df;border-radius:8px;padding:24px;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#8a5a44;">Daily product digest</p>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:500;">Yesterday on Photobookers</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#5c574f;">${escapeHtml(rangeLabel)} (UTC)</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr>
        ${statCell("New users", growth.newUsers)}
        ${statCell("Verified creators", growth.verifiedCreators)}
      </tr>
      <tr>
        ${statCell("New books", growth.newBooks)}
        ${statCell("New favorites", growth.newFavorites)}
      </tr>
      <tr>
        ${statCell("Newsletter signups", growth.newsletterSignups, newsletterUnavailable)}
        ${statCell("Outbound clicks", growth.outboundClicks)}
      </tr>
    </table>

    <h2 style="margin:0 0 12px;font-size:16px;font-weight:600;">Top books by views</h2>
    ${rankedList(buildBookItems(snapshot.topBooksByViews), "No book views yesterday.")}

    <h2 style="margin:24px 0 12px;font-size:16px;font-weight:600;">Top artists by views</h2>
    ${rankedList(buildCreatorItems(snapshot.topArtistsByViews), "No artist profile views yesterday.")}

    <h2 style="margin:24px 0 12px;font-size:16px;font-weight:600;">Top publishers by views</h2>
    ${rankedList(buildCreatorItems(snapshot.topPublishersByViews), "No publisher profile views yesterday.")}

    <p style="margin:24px 0 0;font-size:14px;">
      <a href="${analyticsUrl}" style="color:#8a5a44;">Open analytics dashboard</a>
    </p>
  </div>
</body>
</html>`;
}
