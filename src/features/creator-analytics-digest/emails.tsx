import { botdUrl } from "../app/spotlightUrls";
import { escapeHtml } from "../dashboard/admin/planner/shareKit";
import { formatBotdDateLong } from "../dashboard/admin/planner/utils";
import { analyticsSearchParams } from "../book-analytics/dateRange";
import type { AnalyticsDateRange } from "../book-analytics/dateRange";
import type { CreatorMilestoneKind } from "./milestones";

const SITE_URL = process.env.SITE_URL ?? "https://photobookers.com";

export type DigestTopBook = {
  title: string;
  views: number;
  clicks: number;
};

export type DigestHighlightParams = {
  displayName: string;
  monthLabel: string;
  views: number;
  outboundClicks: number;
  favorites: number;
  newFollowers: number;
  clickRate: number | null;
  topBooks: DigestTopBook[];
  botdBookTitle: string | null;
  botdDate: Date | null;
  profileUrl: string;
  analyticsUrl: string;
};

export type DigestNudgeParams = {
  displayName: string;
  monthLabel: string;
  publishedBookCount: number;
  profileUrl: string;
  analyticsUrl: string;
};

export type MilestoneEmailParams = {
  displayName: string;
  kind: CreatorMilestoneKind;
  bookTitle: string | null;
  profileUrl: string;
  analyticsUrl: string;
};

export function creatorAnalyticsDigestSubject(params: {
  monthLabel: string;
  template: "highlight" | "nudge";
  topBookTitle?: string | null;
  views?: number;
}): string {
  if (params.template === "nudge") {
    return "A quick check-in from Photobookers";
  }
  if (params.topBookTitle && params.views != null && params.views > 0) {
    return `Your photobookers stats for ${params.monthLabel} — ${params.topBookTitle}`;
  }
  return `Your photobookers stats for ${params.monthLabel}`;
}

export function buildAnalyticsDashboardUrl(range: AnalyticsDateRange): string {
  return `${SITE_URL}/dashboard/analytics${analyticsSearchParams(range)}`;
}

function formatDigestBookStats(book: DigestTopBook): string {
  const views = `${book.views} view${book.views === 1 ? "" : "s"}`;
  const clicks =
    book.clicks > 0
      ? `, ${book.clicks} click${book.clicks === 1 ? "" : "s"}`
      : "";
  return `${views}${clicks}`;
}

function topBooksBlock(topBooks: DigestTopBook[]): string {
  if (topBooks.length === 0) return "";
  if (topBooks.length === 1) {
    const book = topBooks[0];
    return `<p>Top book: <strong>${escapeHtml(book.title)}</strong> — ${formatDigestBookStats(book)}.</p>`;
  }
  const heading = topBooks.length < 3 ? "Your books:" : "Top books:";
  const items = topBooks
    .map(
      (book) =>
        `<li><strong>${escapeHtml(book.title)}</strong> — ${formatDigestBookStats(book)}</li>`,
    )
    .join("\n    ");
  return `<p>${heading}</p>\n  <ul>\n    ${items}\n  </ul>`;
}

export function buildCreatorAnalyticsHighlightEmail(
  params: DigestHighlightParams,
): string {
  const clickRateBlock =
    params.views >= 10 && params.clickRate !== null
      ? `<p>Your click rate was <strong>${params.clickRate}%</strong> — the share of viewers who clicked through to buy.</p>`
      : "";

  const topBookBlock = topBooksBlock(params.topBooks);

  const botdBlock =
    params.botdBookTitle && params.botdDate
      ? `<p>Also worth noting: <strong>${escapeHtml(params.botdBookTitle)}</strong> was <a href="${escapeHtml(botdUrl(params.botdDate))}">Book of the Day</a> on ${formatBotdDateLong(params.botdDate)}.</p>`
      : "";

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
  <p><a href="${escapeHtml(params.analyticsUrl)}">See full analytics</a> · <a href="${escapeHtml(params.profileUrl)}">View your profile</a></p>
  <p style="font-size: 12px; color: #666;">Don't want monthly stats emails? Reply to this message and we'll remove you.</p>
  <p>Best regards,<br/>Eanna</p>
`;
}

export function buildCreatorAnalyticsNudgeEmail(
  params: DigestNudgeParams,
): string {
  const singleBookBlock =
    params.publishedBookCount === 1
      ? `<p>You have one book listed — adding more titles gives collectors more reasons to follow you.</p>`
      : "";

  return `
  <p>Hi ${escapeHtml(params.displayName)},</p>
  <p>Your books are live on Photobookers, but they didn't pick up much traffic in <strong>${escapeHtml(params.monthLabel)}</strong> yet — which is normal early on, or if a catalogue hasn't been shared recently.</p>
  <p>Three things that usually help:</p>
  <ul>
    <li><strong>Share your profile</strong> — <a href="${escapeHtml(params.profileUrl)}">${escapeHtml(params.profileUrl)}</a> (link in bio, newsletter, shop footer)</li>
    <li><strong>Check your purchase links</strong> — make sure each book has a working buy link</li>
    <li><strong>Add anything missing</strong> — cover, tags, and a fair you're attending all help discovery</li>
  </ul>
  ${singleBookBlock}
  <p>When traffic picks up, you'll see views, clicks, and favorites in your <a href="${escapeHtml(params.analyticsUrl)}">analytics dashboard</a>.</p>
  <p style="font-size: 12px; color: #666;">Don't want monthly stats emails? Reply to this message and we'll remove you.</p>
  <p>Best regards,<br/>Eanna</p>
`;
}

function milestoneBody(
  kind: CreatorMilestoneKind,
  bookTitle: string | null,
): string {
  switch (kind) {
    case "first_wishlist":
      return bookTitle
        ? `Someone added <strong>${escapeHtml(bookTitle)}</strong> to their favourites — your first on Photobookers.`
        : "Someone favourited one of your books — your first on Photobookers.";

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

export function creatorMilestoneEmailSubject(
  kind: CreatorMilestoneKind,
  bookTitle: string | null,
): string {
  switch (kind) {
    case "first_wishlist":
      return bookTitle
        ? `First favourite on Photobookers — ${bookTitle}`
        : "First favourite on Photobookers";
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

export function buildCreatorMilestoneEmail(
  params: MilestoneEmailParams,
): string {
  return `
  <p>Hi ${escapeHtml(params.displayName)},</p>
  <p>${milestoneBody(params.kind, params.bookTitle)}</p>
  <p><a href="${escapeHtml(params.analyticsUrl)}">View your analytics</a> · <a href="${escapeHtml(params.profileUrl)}">View your profile</a></p>
  <p>Best regards,<br/>Eanna</p>
`;
}
