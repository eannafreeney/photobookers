import { CreatorInterviewStatus } from "../../../../db/schema";
import { toWeekString } from "../../../../lib/utils";
import { aotwUrl, potwUrl, thisWeekPath } from "../../../app/spotlightUrls";
import { formatBotdDateLong } from "./utils";

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

export const generateBOTDNotificationEmail = (
  creator: {
    displayName: string;
    email: string | null;
    slug: string;
    ownerUserId: string | null;
  },
  book: { id: string; title: string; slug: string },
  date: Date,
) => {
  const formattedDate = formatBotdDateLong(date);

  return `
  <p>Hi ${creator.displayName},</p>
  <p>Great news — your book, <strong>${book.title}</strong>, will be featured as <strong>Book of the Day</strong> on Photobookers on <strong>${formattedDate}</strong>.</p>
  <p>You can view the Book of the Day page here: <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/book-of-the-day">View Book of the Day</a>.</p>
  <p>We will also share your feature on our Instagram on the day to help more people discover your work.</p>
  ${
    !creator.ownerUserId
      ? `
    <p>Photobookers is a community for photobook collectors, artists, and publishers:</p>
    <ul>
      <li>Reach a global audience of photobook collectors, curators, and enthusiasts</li>
      <li>Increase visibility for your book and your wider body of work</li>
      <li>Build long-term discoverability through a permanent creator profile</li>
    </ul>
    <p>We would love to have you on board: <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/dashboard/creators/${creator.slug}">Claim your profile</a>.</p>
    `
      : ""
  }
  <p>Thanks for being part of Photobookers - we're excited to spotlight your work.</p>
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

export function buildFeatureDayEmail(params: {
  displayName: string;
  type: "artist" | "publisher";
  weekStart: Date;
  spotlightUrl: string;
  interviewLink: string | null;
  interviewStatus: CreatorInterviewStatus | null;
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
  return `
  <p>Hi ${params.displayName},</p>
  <p>Your <strong>${role}</strong> feature is live today on Photobookers.</p>
  <p>Share your spotlight page:</p>
  <p><a href="${params.spotlightUrl}">${params.spotlightUrl}</a></p>
  <p>Or share the full week roundup: <a href="${digestUrl}">${digestUrl}</a></p>
  ${interviewBlock}
  <p>We will also share your feature on Instagram. Thank you for being part of Photobookers.</p>
  <p>Best regards,<br/>Eanna</p>
`;
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
