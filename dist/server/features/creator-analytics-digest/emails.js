import { botdUrl } from "../app/spotlightUrls.js";
import { escapeHtml } from "../dashboard/admin/planner/shareKit.js";
import { formatBotdDateLong } from "../dashboard/admin/planner/utils.js";
import { analyticsSearchParams } from "../book-analytics/dateRange.js";
const SITE_URL = process.env.SITE_URL ?? "https://photobookers.com";
function creatorAnalyticsDigestSubject(params) {
  if (params.template === "nudge") {
    return "A quick check-in from Photobookers";
  }
  if (params.topBookTitle && params.views != null && params.views > 0) {
    return `Your photobookers stats for ${params.monthLabel} \u2014 ${params.topBookTitle}`;
  }
  return `Your photobookers stats for ${params.monthLabel}`;
}
function buildAnalyticsDashboardUrl(range) {
  return `${SITE_URL}/dashboard/analytics${analyticsSearchParams(range)}`;
}
function formatDigestBookStats(book) {
  const views = `${book.views} view${book.views === 1 ? "" : "s"}`;
  const clicks = book.clicks > 0 ? `, ${book.clicks} click${book.clicks === 1 ? "" : "s"}` : "";
  return `${views}${clicks}`;
}
function topBooksBlock(topBooks) {
  if (topBooks.length === 0) return "";
  if (topBooks.length === 1) {
    const book = topBooks[0];
    return `<p>Top book: <strong>${escapeHtml(book.title)}</strong> \u2014 ${formatDigestBookStats(book)}.</p>`;
  }
  const heading = topBooks.length < 3 ? "Your books:" : "Top books:";
  const items = topBooks.map(
    (book) => `<li><strong>${escapeHtml(book.title)}</strong> \u2014 ${formatDigestBookStats(book)}</li>`
  ).join("\n    ");
  return `<p>${heading}</p>
  <ul>
    ${items}
  </ul>`;
}
function buildCreatorAnalyticsHighlightEmail(params) {
  const clickRateBlock = params.views >= 10 && params.clickRate !== null ? `<p>Your click rate was <strong>${params.clickRate}%</strong> \u2014 the share of viewers who clicked through to buy.</p>` : "";
  const topBookBlock = topBooksBlock(params.topBooks);
  const botdBlock = params.botdBookTitle && params.botdDate ? `<p>Also worth noting: <strong>${escapeHtml(params.botdBookTitle)}</strong> was <a href="${escapeHtml(botdUrl(params.botdDate))}">Book of the Day</a> on ${formatBotdDateLong(params.botdDate)}.</p>` : "";
  return `
  <p>Hi ${escapeHtml(params.displayName)},</p>
  <p>Here's how your books on Photobookers did in <strong>${escapeHtml(params.monthLabel)}</strong>.</p>
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 16px 0;">
    <tr><td style="padding: 4px 16px 4px 0;"><strong>${params.views}</strong> book views</td></tr>
    <tr><td style="padding: 4px 16px 4px 0;"><strong>${params.outboundClicks}</strong> outbound clicks to buy</td></tr>
    <tr><td style="padding: 4px 16px 4px 0;"><strong>${params.favorites}</strong> favorited</td></tr>
    <tr><td style="padding: 4px 16px 4px 0;"><strong>${params.newFollowers}</strong> new followers</td></tr>
  </table>
  ${topBookBlock}
  ${botdBlock}
  ${clickRateBlock}
  <p><a href="${escapeHtml(params.analyticsUrl)}">See full analytics</a> \xB7 <a href="${escapeHtml(params.profileUrl)}">View your profile</a></p>
  <p style="font-size: 12px; color: #666;">Don't want monthly stats emails? Reply to this message and we'll remove you.</p>
  <p>Best regards,<br/>Eanna</p>
`;
}
function buildCreatorAnalyticsNudgeEmail(params) {
  const singleBookBlock = params.publishedBookCount === 1 ? `<p>You have one book listed \u2014 adding more titles gives collectors more reasons to follow you.</p>` : "";
  return `
  <p>Hi ${escapeHtml(params.displayName)},</p>
  <p>Your books are live on Photobookers, but they didn't pick up much traffic in <strong>${escapeHtml(params.monthLabel)}</strong> yet \u2014 which is normal early on, or if a catalogue hasn't been shared recently.</p>
  <p>Three things that usually help:</p>
  <ul>
    <li><strong>Share your profile</strong> \u2014 <a href="${escapeHtml(params.profileUrl)}">${escapeHtml(params.profileUrl)}</a> (link in bio, newsletter, shop footer)</li>
    <li><strong>Check your purchase links</strong> \u2014 make sure each book has a working buy link</li>
    <li><strong>Add anything missing</strong> \u2014 cover, tags, and a fair you're attending all help discovery</li>
  </ul>
  ${singleBookBlock}
  <p>When traffic picks up, you'll see views, clicks, and favorites in your <a href="${escapeHtml(params.analyticsUrl)}">analytics dashboard</a>.</p>
  <p style="font-size: 12px; color: #666;">Don't want monthly stats emails? Reply to this message and we'll remove you.</p>
  <p>Best regards,<br/>Eanna</p>
`;
}
function milestoneBody(kind, bookTitle) {
  switch (kind) {
    case "first_wishlist":
      return bookTitle ? `Someone added <strong>${escapeHtml(bookTitle)}</strong> to their wishlist \u2014 your first on Photobookers.` : "Someone wishlisted one of your books \u2014 your first on Photobookers.";
    case "first_follower":
      return "You have your first follower on Photobookers.";
    case "followers_10":
      return "You now have 10 followers on Photobookers.";
    case "followers_50":
      return "You now have 50 followers on Photobookers.";
    case "profile_views_50":
      return "Your profile reached 50 views on Photobookers.";
    case "profile_views_100":
      return "Your profile reached 100 views on Photobookers.";
    case "views_100":
      return "Your books reached 100 views on Photobookers.";
    case "views_500":
      return "Your books reached 500 views on Photobookers.";
    case "views_1000":
      return "Your books reached 1,000 views on Photobookers.";
  }
}
function creatorMilestoneEmailSubject(kind, bookTitle) {
  switch (kind) {
    case "first_wishlist":
      return bookTitle ? `First wishlist on Photobookers \u2014 ${bookTitle}` : "First wishlist on Photobookers";
    case "first_follower":
      return "Your first follower on Photobookers";
    case "followers_10":
      return "10 followers on Photobookers";
    case "followers_50":
      return "50 followers on Photobookers";
    case "profile_views_50":
      return "50 profile views on Photobookers";
    case "profile_views_100":
      return "100 profile views on Photobookers";
    case "views_100":
      return "100 views on Photobookers";
    case "views_500":
      return "500 views on Photobookers";
    case "views_1000":
      return "1,000 views on Photobookers";
  }
}
function buildCreatorMilestoneEmail(params) {
  return `
  <p>Hi ${escapeHtml(params.displayName)},</p>
  <p>${milestoneBody(params.kind, params.bookTitle)}</p>
  <p><a href="${escapeHtml(params.analyticsUrl)}">View your analytics</a> \xB7 <a href="${escapeHtml(params.profileUrl)}">View your profile</a></p>
  <p>Best regards,<br/>Eanna</p>
`;
}
export {
  buildAnalyticsDashboardUrl,
  buildCreatorAnalyticsHighlightEmail,
  buildCreatorAnalyticsNudgeEmail,
  buildCreatorMilestoneEmail,
  creatorAnalyticsDigestSubject,
  creatorMilestoneEmailSubject
};
