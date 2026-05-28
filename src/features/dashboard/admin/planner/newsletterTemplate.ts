import { toDateString } from "../../../../lib/utils";

export type WeeklyNewsletterBookItem = {
  date: string;
  bookId: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  artistName: string | null;
  artistSlug: string | null;
  publisherName: string | null;
  publisherSlug: string | null;
};

const appBaseUrl = process.env.PUBLIC_APP_URL ?? "https://www.photobookers.com";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildBookCard = (item: WeeklyNewsletterBookItem) => {
  const bookUrl = `${appBaseUrl}/books/${item.bookSlug}`;
  const coverBlock = item.coverUrl
    ? `<img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}" width="96" style="display:block;width:96px;height:auto;border-radius:8px;" />`
    : "";
  const artistLabel = item.artistName
    ? `<p style="margin:4px 0 0;color:#444;font-size:14px;">Artist: ${escapeHtml(item.artistName)}</p>`
    : "";
  const publisherLabel = item.publisherName
    ? `<p style="margin:2px 0 0;color:#444;font-size:14px;">Publisher: ${escapeHtml(item.publisherName)}</p>`
    : "";

  return `
    <tr>
      <td style="padding:12px 0;border-top:1px solid #ececec;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="112" valign="top">${coverBlock}</td>
            <td valign="top">
              <p style="margin:0 0 4px;font-size:12px;color:#666;">${escapeHtml(item.date)}</p>
              <p style="margin:0;color:#111;font-size:18px;font-weight:600;">${escapeHtml(item.title)}</p>
              ${artistLabel}
              ${publisherLabel}
              <p style="margin:10px 0 0;">
                <a href="${escapeHtml(bookUrl)}" style="color:#b45309;text-decoration:none;font-weight:600;">View book</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};

export function renderWeeklyBOTDNewsletterHtml(params: {
  weekStart: Date;
  weekEnd: Date;
  subject: string;
  introText: string;
  outroText: string;
  ctaText: string;
  items: WeeklyNewsletterBookItem[];
}) {
  const weekLabel = `${toDateString(params.weekStart)} to ${toDateString(params.weekEnd)}`;
  const cards =
    params.items.length > 0
      ? params.items.map(buildBookCard).join("")
      : `<tr><td style="padding:16px 0;border-top:1px solid #ececec;color:#555;">No BOTD entries were scheduled for this week.</td></tr>`;

  return `
  <!doctype html>
  <html>
    <body style="margin:0;padding:24px;background:#f8f8f8;font-family:Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fff;border:1px solid #e8e8e8;border-radius:10px;padding:24px;">
              <tr><td style="font-size:12px;color:#666;">Weekly BOTD roundup: ${escapeHtml(weekLabel)}</td></tr>
              <tr><td style="padding-top:8px;font-size:28px;font-weight:700;color:#111;">${escapeHtml(params.subject)}</td></tr>
              <tr><td style="padding-top:16px;color:#333;line-height:1.6;">${escapeHtml(params.introText)}</td></tr>
              ${cards}
              <tr>
                <td style="padding-top:16px;color:#333;line-height:1.6;">${escapeHtml(params.outroText)}</td>
              </tr>
              <tr>
                <td style="padding-top:20px;">
                  <a href="${escapeHtml(`${appBaseUrl}/books`)}" style="display:inline-block;padding:10px 16px;background:#b45309;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">${escapeHtml(params.ctaText)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
