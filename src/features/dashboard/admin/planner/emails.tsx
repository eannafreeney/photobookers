import { Book } from "../../../../db/schema";

export const generateBOTWNotificationEmail = (
  creator: {
    displayName: string;
    email: string | null;
    slug: string;
    ownerUserId: string | null;
  },
  book: Book,
) => {
  return `
  <h2>Dear ${creator.displayName},</h2>
  <p>We are delighted to announce that your book, <strong>${book.title}</strong>, is <strong>Book of the Week</strong> on Photobookers this week.</p>
  <p>You can view the book here: <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/books/${book.slug}">${book.title}</a></p>
  ${
    !creator.ownerUserId &&
    `<p>We would love to have you on Photobookers. You can view and claim your profile <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/dashboard/creators/${creator.slug}">here</a>.</p>`
  }
  <p>Best regards,</p>
  <p>Eanna</p>
`;
};

export const generateFeaturedBookNotificationEmail = (
  creator: {
    displayName: string;
    email: string | null;
    slug: string;
    type: "artist" | "publisher";
    ownerUserId: string | null;
  },
  book: { id: string; title: string; slug: string },
) => {
  return `
    <h2>Dear ${creator.displayName},</h2>
    <p>We are delighted to announce that your book, <strong>${book.title}</strong>, is featured on Photobookers this week.</p>
    <p>You can view the book here: <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/books/${book.slug}">${book.title}</a></p>
    ${
      !creator.ownerUserId &&
      `<p>We would love to have you on Photobookers. You can view and claim your profile <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/dashboard/creators/${creator.slug}">here</a>.</p>`
    }
    <p>Best regards,</p>
    <p>Eanna</p>
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
    <h2>Dear ${creator.displayName},</h2>
    <p>We are delighted to announce that you are <strong>Artist of the Week</strong> on Photobookers this week.</p>
    ${
      !creator.ownerUserId &&
      `<p>We would love to have you on Photobookers. You can view and claim your profile <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/dashboard/creators/${creator.slug}">here</a>.</p>`
    }
    <p>Best regards,</p>
    <p>Eanna</p>
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
  <h2>Dear ${creator.displayName},</h2>
  <p>We are delighted to announce that you are <strong>Publisher of the Week</strong> on Photobookers this week.</p>
  ${
    !creator.ownerUserId &&
    `<p>We would love to have you on Photobookers. You can view and claim your profile <a href="${process.env.SITE_URL ?? "https://photobookers.com"}/dashboard/creators/${creator.slug}">here</a>.</p>`
  }
  <p>Best regards,</p>
  <p>Eanna</p>
`;
};
