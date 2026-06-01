import { formatBotdDateLong } from "./utils";

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

export const buildAOTWNotificationEmail = (creator: {
  displayName: string;
  email: string | null;
  slug: string;
  type: "artist" | "publisher";
  ownerUserId: string | null;
}) => {
  return `
  <p>Hi ${creator.displayName},</p>
  <p>Great news - you have been selected as <strong>Artist of the Week</strong> on Photobookers.</p>
  <p>Your feature is now live here: <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/artist-of-the-week">View Artist of the Week</a>.</p>
  <p>We will also share your feature on our Instagram later this week to help more people discover your work.</p>
  ${
    !creator.ownerUserId
      ? `
    <p>Photobookers is a social network for photobook collectors, artists, and publishers:</p>
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

export const buildPOTWNotificationEmail = (creator: {
  displayName: string;
  email: string | null;
  slug: string;
  type: "artist" | "publisher";
  ownerUserId: string | null;
}) => {
  return `
  <p>Hi ${creator.displayName},</p>
  <p>Great news - you have been selected as <strong>Publisher of the Week</strong> on Photobookers.</p>
  <p>Your feature is now live here: <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/publisher-of-the-week">View Publisher of the Week</a>.</p>
  <p>We will also share your feature on our Instagram later this week to help more people discover your work.</p>
  ${
    !creator.ownerUserId
      ? `
    <p>Photobookers is a social network for photobook collectors, artists, and publishers:</p>
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
