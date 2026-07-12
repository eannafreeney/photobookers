import { CreatorInterviewStatus } from "../../../../db/schema";
import { toWeekStart, toWeekString } from "../../../../lib/utils";
import {
  aotwUrl,
  botdUrl,
  potwUrl,
  thisWeekPath,
} from "../../../app/spotlightUrls";
import {
  buildBotdShareKitEmailHtml,
  buildCreatorShareKitEmailHtml,
  escapeHtml,
} from "./shareKit";
import { formatBotdDateLong, formatWeekRange } from "./utils";
import type { InstagramPrepGap } from "./social-media/instagramUtils";
import type { SpotlightContentItem } from "./spotlightBlurb";

type SpotlightEmailParams = {
  creator: { displayName: string; slug: string; ownerUserId: string | null };
  weekStart: Date;
  interviewLink: string | null;
  interviewStatus: CreatorInterviewStatus | null;
};

function interviewSection(params: SpotlightEmailParams): string {
  if (params.interviewStatus === "completed") {
    return `<p>Thank you — we already have your interview answers and will publish them with your feature.</p>`;
  }
  if (params.interviewLink) {
    return `
      <p>We would love to include a short interview alongside your feature (about 10 minutes) to help promote your work.</p>
      <p><a href="${params.interviewLink}">Start the interview</a></p>
    `;
  }
  return "";
}

function memberSection(creator: {
  slug: string;
  ownerUserId: string | null;
}): string {
  if (creator.ownerUserId) {
    return "";
  }

  return `
      <p>We would love to have you on board: <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/dashboard/creators/${creator.slug}">Claim your profile</a>.</p>
      <p>Photobookers is the community for photobook collectors, artists, and publishers:</p>
      <ul>
        <li>Reach a global audience of photobook collectors, curators, and enthusiasts</li>
        <li>Increase visibility for your book and your wider body of work</li>
        <li>Build long-term discoverability through a permanent creator profile</li>
      </ul>
      `;
}

export type BotdNotificationAccountCredentials =
  | {
      kind: "created";
      email: string;
      temporaryPassword: string;
      loginUrl: string;
    }
  | {
      kind: "linked";
      email: string;
      loginUrl: string;
    };

function buildBotdAccountCredentialsHtml(
  credentials: BotdNotificationAccountCredentials,
): string {
  if (credentials.kind === "created") {
    return `
  <p>We created a Photobookers account for you so you can manage your profile before your feature goes live:</p>
  <p><a href="${escapeHtml(credentials.loginUrl)}">Log in to your profile</a></p>
  <p>You will be asked to set a new password when you first sign in.</p>
  `;
  }

  return `
  <p>We linked your existing Photobookers account to your creator profile.</p>
  <p><a href="${escapeHtml(credentials.loginUrl)}">Log in</a> to update your bio, cover image, and links before your feature goes live.</p>
  `;
}

export const generateBOTDNotificationEmail = (
  creator: {
    displayName: string;
    email: string | null;
    slug: string;
    ownerUserId: string | null;
  },
  book: { id: string; title: string; slug: string },
  date: Date,
  accountCredentials?: BotdNotificationAccountCredentials,
) => {
  const formattedDate = formatBotdDateLong(date);
  const spotlightUrl = botdUrl(date);
  const accountBlock = accountCredentials
    ? buildBotdAccountCredentialsHtml(accountCredentials)
    : "";
  const claimBlock =
    creator.ownerUserId || accountCredentials ? "" : memberSection(creator);
  const profilePrompt =
    creator.ownerUserId || accountCredentials
      ? `<p>Now is a good time to make sure your bio, cover image, and links are up to date before the feature goes live.</p>`
      : `<p>We would love you to <strong>claim your profile</strong> before the feature goes live so you can update your bio, cover image, and links.</p>`;

  return `
  <p>Hi ${creator.displayName},</p>
  <p>Great news — your book, <strong>${book.title}</strong>, is scheduled as <strong>Book of the Day</strong> on Photobookers on <strong>${formattedDate}</strong> (one week from today).</p>
  <p>Your feature page will be here: <a href="${spotlightUrl}">${spotlightUrl}</a></p>
  <p>We will share your feature on our Instagram on the day to help more people discover your work.</p>
  ${accountBlock}
  ${profilePrompt}
  ${claimBlock}
  <p>Thanks for being part of Photobookers — we're excited to spotlight your work.</p>
  <p>Best regards,<br/>Eanna</p>
`;
};

export const buildCreatorOfTheWeekNotificationEmail = (params: {
  displayName: string;
  email: string | null;
  slug: string;
  type: "artist" | "publisher";
  ownerUserId: string | null;
  weekStart: Date;
  interviewLink: string | null;
  interviewStatus: CreatorInterviewStatus | null;
}) => {
  return `
  <p>Hi ${params.displayName},</p>
  <p>Great news - you have been selected as ${params.type === "artist" ? "Artist of the Week" : "Publisher of the Week"} on Photobookers for the week starting ${toWeekString(params.weekStart)}.</p>
  ${interviewSection({ creator: params, weekStart: params.weekStart, interviewLink: params.interviewLink, interviewStatus: params.interviewStatus })}
  ${memberSection(params)}
  <p>We will share your feature on our Instagram to help more people discover your work.</p>
  <p>Thanks for being part of Photobookers - we're excited to spotlight your work.</p>
  <p>Best regards,<br/>Eanna</p>
`;
};

export function spotlightUrlForType(
  type: "artist" | "publisher",
  weekStart: Date,
): string {
  return type === "artist" ? aotwUrl(weekStart) : potwUrl(weekStart);
}

export function buildInterviewReminderEmail(params: {
  displayName: string;
  type: "artist" | "publisher";
  weekStart: Date;
  interviewLink: string | null;
}) {
  const role =
    params.type === "artist" ? "Artist of the Week" : "Publisher of the Week";
  const weekLabel = toWeekString(params.weekStart);
  return `
  <p>Hi ${params.displayName},</p>
  <p>Just a friendly reminder — you are scheduled as <strong>${role}</strong> on Photobookers for the week starting <strong>${weekLabel}</strong>.</p>
  <p>We would still love to include a short interview alongside your feature (about 10 minutes).</p>
  ${
    params.interviewLink
      ? `<p><a href="${params.interviewLink}">Complete the interview</a></p>`
      : ""
  }
  <p>Thanks,<br/>Eanna</p>
`;
}

export function buildBotdFeatureDayEmail(params: {
  displayName: string;
  recipientType: "artist" | "publisher";
  bookTitle: string;
  artistName: string;
  botdDate: Date;
  spotlightUrl: string;
  instagram?: string | null;
}) {
  const formattedDate = formatBotdDateLong(params.botdDate);
  const digestUrl = `${process.env.SITE_URL ?? "https://photobookers.com"}${thisWeekPath(toWeekStart(params.botdDate))}`;
  const shareKit = buildBotdShareKitEmailHtml({
    recipientType: params.recipientType,
    bookTitle: params.bookTitle,
    artistName: params.artistName,
    spotlightUrl: params.spotlightUrl,
    digestUrl,
    instagram: params.instagram,
  });

  return `
  <p>Hi ${params.displayName},</p>
  <p>Your book, <strong>${params.bookTitle}</strong>, is <strong>Book of the Day</strong> on Photobookers today (${formattedDate}).</p>
  ${shareKit}
  <p>We will also share your feature on our Instagram. Thank you for being part of Photobookers.</p>
  <p>Best regards,<br/>Eanna</p>
`;
}

export function buildFeatureDayEmail(params: {
  displayName: string;
  type: "artist" | "publisher";
  weekStart: Date;
  spotlightUrl: string;
  interviewLink: string | null;
  interviewStatus: CreatorInterviewStatus | null;
  instagram?: string | null;
}) {
  const role =
    params.type === "artist" ? "Artist of the Week" : "Publisher of the Week";
  const digestUrl = `${process.env.SITE_URL ?? "https://photobookers.com"}${thisWeekPath(params.weekStart)}`;
  const interviewBlock =
    params.interviewStatus !== "completed" &&
    params.interviewStatus !== "published" &&
    params.interviewLink
      ? `<p>If you have a moment, you can still <a href="${params.interviewLink}">complete the interview</a>.</p>`
      : "";
  const shareKit = buildCreatorShareKitEmailHtml({
    type: params.type,
    spotlightUrl: params.spotlightUrl,
    digestUrl,
    instagram: params.instagram,
  });
  return `
  <p>Hi ${params.displayName},</p>
  <p>Your <strong>${role}</strong> feature is live today on Photobookers.</p>
  ${shareKit}
  ${interviewBlock}
  <p>We will also share your feature on Instagram. Thank you for being part of Photobookers.</p>
  <p>Best regards,<br/>Eanna</p>
`;
}

function formatInstagramPrepGap(gap: InstagramPrepGap): string {
  switch (gap.kind) {
    case "botd":
      return `Book of the Day (${formatBotdDateLong(gap.date)})`;
    case "artist":
      return "Artist of the Week";
    case "publisher":
      return "Publisher of the Week";
  }
}

export function buildInstagramPrepReminderEmail(params: {
  weekStart: Date;
  gaps: InstagramPrepGap[];
  prepareUrl: string;
}) {
  const weekLabel = formatWeekRange(params.weekStart);
  const items = params.gaps
    .map((gap) => `<li>${formatInstagramPrepGap(gap)}</li>`)
    .join("");

  return `
  <p>Instagram posts are not fully prepared for the week of <strong>${weekLabel}</strong>, which starts in two days.</p>
  <p>Still to prepare:</p>
  <ul>${items}</ul>
  <p><a href="${params.prepareUrl}">Prepare Instagram posts</a></p>
`;
}

function formatPreviewItemHeading(item: SpotlightContentItem): string {
  switch (item.kind) {
    case "botd":
      return `Book of the Day — ${formatBotdDateLong(item.date)}`;
    case "artist":
      return "Artist of the Week";
    case "publisher":
      return "Publisher of the Week";
  }
}

function renderPreviewImages(imageUrls: string[], alt: string): string {
  if (imageUrls.length === 0) {
    return `<p><em>No Instagram images selected</em></p>`;
  }
  return imageUrls
    .map(
      (imageUrl, index) =>
        `<p><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)} (${index + 1} of ${imageUrls.length})" width="320" style="max-width:100%;height:auto;border:1px solid #ddd;" /></p>`,
    )
    .join("");
}

function renderCaptionBlock(caption: string): string {
  return `<pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:13px;background:#f6f6f6;padding:12px;border-radius:4px;">${escapeHtml(caption)}</pre>`;
}

export function buildPlannerWeekContentPreviewEmail(params: {
  weekStart: Date;
  items: SpotlightContentItem[];
  feedPreviewUrls?: Map<string, string[]>;
  prepWarnings: string[];
  plannerUrl: string;
  featuredHeroUrl: string;
  instagramPrepUrl: string;
}) {
  const weekLabel = formatWeekRange(params.weekStart);
  const warningBlock =
    params.prepWarnings.length > 0
      ? `<p style="color:#b45309;"><strong>Warnings:</strong></p><ul>${params.prepWarnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
      : "";

  const sections = params.items
    .map((item) => {
      const heading = formatPreviewItemHeading(item);
      const previewKey =
        item.kind === "botd"
          ? `botd-${item.date.toISOString().slice(0, 10)}`
          : item.kind;
      const imageUrls =
        params.feedPreviewUrls?.get(previewKey) ?? item.instagramImageUrls;
      const blurb = item.spotlightBlurb?.trim() || item.sourceText?.trim();
      const blurbHtml = blurb
        ? `<p style="margin:0 0 16px;">${escapeHtml(blurb)}</p>`
        : `<p style="margin:0 0 16px;"><em>No page blurb available</em></p>`;

      return `
      <section style="margin:24px 0;padding-top:16px;border-top:1px solid #ddd;">
        <h2 style="margin:0 0 12px;font-size:18px;">${escapeHtml(heading)}</h2>
        <p style="margin:0 0 4px;font-weight:600;">${escapeHtml(item.title)}</p>
        <p style="margin:0 0 8px;font-size:13px;color:#666;">Instagram feed preview (lead slide branded)</p>
        ${renderPreviewImages(imageUrls, item.title)}
        <p style="margin:16px 0 4px;font-weight:600;">Page blurb</p>
        ${blurbHtml}
        <p style="margin:0 0 4px;font-weight:600;">Instagram caption</p>
        ${renderCaptionBlock(item.instagramCaption)}
      </section>`;
    })
    .join("");

  return `
  <p>Your planner week of <strong>${weekLabel}</strong> is ready for review. It starts in three days.</p>
  ${warningBlock}
  ${sections}
  <p style="margin-top:24px;">
    <a href="${params.plannerUrl}">Open planner</a> ·
    <a href="${params.featuredHeroUrl}">Edit featured images</a> ·
    <a href="${params.instagramPrepUrl}">Edit Instagram prep</a>
  </p>
`;
}

export type InstagramPreviewEmailPost = {
  title: string;
  imageUrls: string[];
  caption: string;
  scheduledAt: Date;
  cancelUrl: string;
};

function renderRemovePostButton(cancelUrl: string): string {
  return `<p style="margin:16px 0 0;"><a href="${escapeHtml(cancelUrl)}" style="display:inline-block;padding:8px 14px;background:#b91c1c;color:#fff;text-decoration:none;border-radius:4px;font-weight:600;">Remove post</a></p>`;
}

function formatScheduledAt(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function buildInstagramPostsPreviewEmail(params: {
  intro: string;
  posts: InstagramPreviewEmailPost[];
  footerUrl?: string;
}) {
  const sections = params.posts
    .map((post) => {
      return `
      <section style="margin:24px 0;padding-top:16px;border-top:1px solid #ddd;">
        <h2 style="margin:0 0 8px;font-size:18px;">${escapeHtml(post.title)}</h2>
        <p style="margin:0 0 12px;font-size:13px;color:#666;">Scheduled for ${escapeHtml(formatScheduledAt(post.scheduledAt))}</p>
        ${renderPreviewImages(post.imageUrls, post.title)}
        <p style="margin:16px 0 4px;font-weight:600;">Caption</p>
        ${renderCaptionBlock(post.caption)}
        ${renderRemovePostButton(post.cancelUrl)}
      </section>`;
    })
    .join("");

  const footer = params.footerUrl
    ? `<p style="margin-top:24px;"><a href="${escapeHtml(params.footerUrl)}">Open planner</a></p>`
    : "";

  return `
  <p>${params.intro}</p>
  ${sections}
  ${footer}
`;
}

export function buildTrendingInstagramPreviewEmail(params: {
  editionWeekStart: string;
  posts: InstagramPreviewEmailPost[];
  plannerUrl: string;
}) {
  return buildInstagramPostsPreviewEmail({
    intro: `Trending Instagram carousels for newsletter edition <strong>${escapeHtml(params.editionWeekStart)}</strong> are scheduled. Each post goes live at least 24 hours after this email.`,
    posts: params.posts,
    footerUrl: params.plannerUrl,
  });
}

export function buildVerifiedCreatorInstagramPreviewEmail(params: {
  displayName: string;
  posts: InstagramPreviewEmailPost[];
}) {
  return buildInstagramPostsPreviewEmail({
    intro: `A <strong>New on photobookers</strong> Instagram post for <strong>${escapeHtml(params.displayName)}</strong> is scheduled.`,
    posts: params.posts,
  });
}

export function buildAotwPublisherNotifyEmail(params: {
  publisherName: string;
  artistName: string;
  weekStart: Date;
  spotlightUrl: string;
}) {
  const digestUrl = `${process.env.SITE_URL ?? "https://photobookers.com"}${thisWeekPath(params.weekStart)}`;
  return `
  <p>Hi ${params.publisherName},</p>
  <p><strong>${params.artistName}</strong>, an artist you have published on Photobookers, is featured as <strong>Artist of the Week</strong> starting ${toWeekString(params.weekStart)}.</p>
  <p>Share their spotlight page:</p>
  <p><a href="${params.spotlightUrl}">${params.spotlightUrl}</a></p>
  <p>Or share the full week roundup: <a href="${digestUrl}">${digestUrl}</a></p>
  <p>Best regards,<br/>Eanna</p>
`;
}
