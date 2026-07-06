import { toWeekStart, toWeekString } from "../../../../lib/utils.js";
import {
  aotwUrl,
  botdUrl,
  potwUrl,
  thisWeekPath
} from "../../../app/spotlightUrls.js";
import {
  buildBotdShareKitEmailHtml,
  buildCreatorShareKitEmailHtml,
  escapeHtml
} from "./shareKit.js";
import { formatBotdDateLong, formatWeekRange } from "./utils.js";
function interviewSection(params) {
  if (params.interviewStatus === "completed") {
    return `<p>Thank you \u2014 we already have your interview answers and will publish them with your feature.</p>`;
  }
  if (params.interviewLink) {
    return `
      <p>We would love to include a short interview alongside your feature (about 10 minutes) to help promote your work.</p>
      <p><a href="${params.interviewLink}">Start the interview</a></p>
    `;
  }
  return "";
}
function memberSection(creator) {
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
function buildBotdAccountCredentialsHtml(credentials) {
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
const generateBOTDNotificationEmail = (creator, book, date, accountCredentials) => {
  const formattedDate = formatBotdDateLong(date);
  const spotlightUrl = botdUrl(date);
  const accountBlock = accountCredentials ? buildBotdAccountCredentialsHtml(accountCredentials) : "";
  const claimBlock = creator.ownerUserId || accountCredentials ? "" : memberSection(creator);
  const profilePrompt = creator.ownerUserId || accountCredentials ? `<p>Now is a good time to make sure your bio, cover image, and links are up to date before the feature goes live.</p>` : `<p>We would love you to <strong>claim your profile</strong> before the feature goes live so you can update your bio, cover image, and links.</p>`;
  return `
  <p>Hi ${creator.displayName},</p>
  <p>Great news \u2014 your book, <strong>${book.title}</strong>, is scheduled as <strong>Book of the Day</strong> on Photobookers on <strong>${formattedDate}</strong> (one week from today).</p>
  <p>Your feature page will be here: <a href="${spotlightUrl}">${spotlightUrl}</a></p>
  <p>We will share your feature on our Instagram on the day to help more people discover your work.</p>
  ${accountBlock}
  ${profilePrompt}
  ${claimBlock}
  <p>Thanks for being part of Photobookers \u2014 we're excited to spotlight your work.</p>
  <p>Best regards,<br/>Eanna</p>
`;
};
const buildCreatorOfTheWeekNotificationEmail = (params) => {
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
function spotlightUrlForType(type, weekStart) {
  return type === "artist" ? aotwUrl(weekStart) : potwUrl(weekStart);
}
function buildInterviewReminderEmail(params) {
  const role = params.type === "artist" ? "Artist of the Week" : "Publisher of the Week";
  const weekLabel = toWeekString(params.weekStart);
  return `
  <p>Hi ${params.displayName},</p>
  <p>Just a friendly reminder \u2014 you are scheduled as <strong>${role}</strong> on Photobookers for the week starting <strong>${weekLabel}</strong>.</p>
  <p>We would still love to include a short interview alongside your feature (about 10 minutes).</p>
  ${params.interviewLink ? `<p><a href="${params.interviewLink}">Complete the interview</a></p>` : ""}
  <p>Thanks,<br/>Eanna</p>
`;
}
function buildBotdFeatureDayEmail(params) {
  const formattedDate = formatBotdDateLong(params.botdDate);
  const digestUrl = `${process.env.SITE_URL ?? "https://photobookers.com"}${thisWeekPath(toWeekStart(params.botdDate))}`;
  const shareKit = buildBotdShareKitEmailHtml({
    recipientType: params.recipientType,
    bookTitle: params.bookTitle,
    artistName: params.artistName,
    spotlightUrl: params.spotlightUrl,
    digestUrl,
    instagram: params.instagram
  });
  return `
  <p>Hi ${params.displayName},</p>
  <p>Your book, <strong>${params.bookTitle}</strong>, is <strong>Book of the Day</strong> on Photobookers today (${formattedDate}).</p>
  ${shareKit}
  <p>We will also share your feature on our Instagram. Thank you for being part of Photobookers.</p>
  <p>Best regards,<br/>Eanna</p>
`;
}
function buildFeatureDayEmail(params) {
  const role = params.type === "artist" ? "Artist of the Week" : "Publisher of the Week";
  const digestUrl = `${process.env.SITE_URL ?? "https://photobookers.com"}${thisWeekPath(params.weekStart)}`;
  const interviewBlock = params.interviewStatus !== "completed" && params.interviewStatus !== "published" && params.interviewLink ? `<p>If you have a moment, you can still <a href="${params.interviewLink}">complete the interview</a>.</p>` : "";
  const shareKit = buildCreatorShareKitEmailHtml({
    type: params.type,
    spotlightUrl: params.spotlightUrl,
    digestUrl,
    instagram: params.instagram
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
function formatInstagramPrepGap(gap) {
  switch (gap.kind) {
    case "botd":
      return `Book of the Day (${formatBotdDateLong(gap.date)})`;
    case "artist":
      return "Artist of the Week";
    case "publisher":
      return "Publisher of the Week";
  }
}
function buildInstagramPrepReminderEmail(params) {
  const weekLabel = formatWeekRange(params.weekStart);
  const items = params.gaps.map((gap) => `<li>${formatInstagramPrepGap(gap)}</li>`).join("");
  return `
  <p>Instagram posts are not fully prepared for the week of <strong>${weekLabel}</strong>, which starts in two days.</p>
  <p>Still to prepare:</p>
  <ul>${items}</ul>
  <p><a href="${params.prepareUrl}">Prepare Instagram posts</a></p>
`;
}
function buildAotwPublisherNotifyEmail(params) {
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
export {
  buildAotwPublisherNotifyEmail,
  buildBotdFeatureDayEmail,
  buildCreatorOfTheWeekNotificationEmail,
  buildFeatureDayEmail,
  buildInstagramPrepReminderEmail,
  buildInterviewReminderEmail,
  generateBOTDNotificationEmail,
  spotlightUrlForType
};
