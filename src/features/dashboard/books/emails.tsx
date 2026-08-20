import { Book, Creator } from "../../../db/schema";
import { bookLiveInstagramCaption, bookShareTitle } from "../../../lib/share";
import { bookUrl } from "../../app/spotlightUrls";
import { escapeHtml } from "../admin/planner/shareKit";

export const generateBookNotificationEmail = (book: Book, creator: Creator) => {
  return `
    <h2>New book created</h2>
    <p>A new book has been published.</p>
    <p>Title: ${book.title}</p>
    <p>Creator: ${creator.displayName}</p>
    
    <p><a href="${process.env.SITE_URL ?? "https://photobookers.com"}/books/${book.slug}">View the book</a></p>
  `;
};

export function buildBookLiveEmailHtml(params: {
  recipientName: string;
  bookTitle: string;
  artistName?: string | null;
  bookSlug: string;
  coverUrl: string;
  instagram?: string | null;
}): string {
  const pageUrl = bookUrl(params.bookSlug);
  const caption = bookLiveInstagramCaption({
    bookTitle: params.bookTitle,
    artistName: params.artistName,
    bookUrl: pageUrl,
    instagram: params.instagram,
  });
  const shareTitle = bookShareTitle({
    title: params.bookTitle,
    artist: params.artistName ? { displayName: params.artistName } : null,
  });

  return `
  <p>Hi ${escapeHtml(params.recipientName)},</p>
  <p>Great news — <strong>${escapeHtml(params.bookTitle)}</strong> is now live on Photobookers.</p>
  <p><a href="${escapeHtml(pageUrl)}">View your book</a></p>
  <p style="margin:16px 0;"><img src="${escapeHtml(params.coverUrl)}" alt="${escapeHtml(params.bookTitle)}" width="240" style="max-width:240px;height:auto;border:1px solid #eee;border-radius:4px;display:block;" /></p>
  <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />
  <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#111;">Share kit</p>
  <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#444;">Spread the word — here is ready-made copy you can paste into Instagram or your newsletter:</p>
  <pre style="margin:0 0 16px;padding:12px;background:#f5f5f5;border-radius:8px;font-size:13px;line-height:1.5;white-space:pre-wrap;color:#111;">${escapeHtml(caption)}</pre>
  <p style="margin:0;font-size:14px;line-height:1.5;color:#444;">Book page:<br/><a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a></p>
  <p style="margin:16px 0 0;font-size:13px;color:#666;">Share title: ${escapeHtml(shareTitle)}</p>
  <p style="margin:24px 0 0;">Thank you for being part of Photobookers.</p>
  <p>Best regards,<br/>Photobookers</p>
`;
}

export function bookLiveEmailSubject(bookTitle: string): string {
  return `Your book is live: ${bookTitle}`;
}
