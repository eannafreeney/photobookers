import { creatorUrl } from "../features/app/spotlightUrls";

type CreatorProfileShareFields = CreatorShareFields & {
  slug: string;
};

type BookShareFields = {
  title: string;
  artist?: { displayName: string } | null;
};

type CreatorShareFields = {
  displayName: string;
  type?: string | null;
};

export function creatorProfileUrl(slug: string): string {
  return creatorUrl(slug);
}

export function creatorVerifiedSharePost(
  creator: CreatorProfileShareFields,
): string {
  const label = creator.type === "publisher" ? "publisher" : "artist";
  const profileUrl = creatorProfileUrl(creator.slug);
  return `I'm on Photobookers — a place to discover photobooks and follow the artists and publishers behind them.
Find my ${label} profile and books here:
${profileUrl}`;
}

export function creatorVerifiedSharePostHtml(
  creator: CreatorProfileShareFields,
): string {
  const post = creatorVerifiedSharePost(creator);
  return `<pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f5;padding:12px;border-radius:4px">${post.replace(/</g, "&lt;")}</pre>`;
}

export function bookShareTitle(book: BookShareFields): string {
  if (book.artist?.displayName) {
    return `${book.title} by ${book.artist.displayName}`;
  }
  return book.title;
}

export function bookShareText(book: BookShareFields): string {
  return `${bookShareTitle(book)} — on Photobookers`;
}

export function bookLiveInstagramCaption(params: {
  bookTitle: string;
  artistName?: string | null;
  bookUrl: string;
  instagram?: string | null;
  /** Contributor who submitted someone else's book — not the artist/publisher. */
  addedBy?: "owner" | "contributor";
}): string {
  const byArtist = params.artistName ? ` by ${params.artistName}` : "";
  const intro =
    params.addedBy === "contributor"
      ? `I added book "${params.bookTitle}"${byArtist} — live on @photobookers.`
      : `My book "${params.bookTitle}"${byArtist} is live on @photobookers.`;
  const lines = [
    intro,
    "",
    params.bookUrl,
  ];
  const handle = params.instagram?.trim();
  if (handle) {
    const normalized = handle.startsWith("@") ? handle : `@${handle}`;
    lines.push("", normalized);
  }
  lines.push("", "#photobook #photobookjousting");
  return lines.join("\n");
}

export function listPath(shelfSlug: string, listSlug: string): string {
  return `/shelf/${shelfSlug}/lists/${listSlug}`;
}

export function listShareTitle(listTitle: string): string {
  return listTitle;
}

export function listShareText(listTitle: string, ownerName: string): string {
  return `${listTitle} — a photobook list by ${ownerName} on Photobookers`;
}

export function postPath(postId: string): string {
  return `/posts/${postId}`;
}

export function postUrl(postId: string, siteUrl?: string): string {
  const base = (siteUrl ?? process.env.SITE_URL ?? "https://photobookers.com").replace(
    /\/$/,
    "",
  );
  return `${base}${postPath(postId)}`;
}

export function postShareText(authorName: string): string {
  return `Post by ${authorName} on Photobookers`;
}

export function bookOfTheDayShareTitle(book: BookShareFields): string {
  return `Book of the Day — ${book.title}`;
}

export function bookOfTheDayShareText(book: BookShareFields): string {
  const byArtist = book.artist?.displayName
    ? ` by ${book.artist.displayName}`
    : "";
  return `${book.title}${byArtist} — featured on Photobookers`;
}

export function creatorShareText(creator: CreatorShareFields): string {
  const label = creator.type === "publisher" ? "publisher" : "artist";
  return `${creator.displayName} — ${label} on Photobookers`;
}

export function shelfProfileUrl(slug: string): string {
  return `/shelf/${slug}`;
}

export function shelfShareTitle(ownerName: string): string {
  return `${ownerName}'s shelf`;
}

export function shelfShareText(ownerName: string): string {
  return `${ownerName}'s favorite photobooks on Photobookers`;
}

export function creatorOfTheWeekShareTitle(
  creator: CreatorShareFields,
  role: string,
): string {
  return `${role} of the Week — ${creator.displayName}`;
}

export function creatorOfTheWeekShareText(
  creator: CreatorShareFields,
  role: string,
): string {
  return `${creator.displayName} is ${role} of the Week on Photobookers`;
}

export function resolveShareUrl(
  url: string | undefined,
  origin: string,
): string {
  const trimmed = url?.trim();
  if (!trimmed) return origin;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return new URL(trimmed, origin).href;
}

/**
 * Payload for navigator.share on mobile.
 *
 * Do not pass a separate `url` alongside `text`: many share sheets concatenate
 * `url + " " + text`, and linkifiers then treat the copy as part of the path
 * (e.g. /lists/my-slug Check out … → 400 on slug validation).
 */
export function nativeSharePayload(title: string, text: string, url: string): {
  title: string;
  text: string;
} {
  return { title, text: `${text}\n${url}` };
}

/**
 * Desktop Chromium's share-sheet "Copy" joins title + text (+ file:// for
 * images) into one clipboard blob — paste becomes a Google search or a local
 * WebShare path. Rich share (caption / image) is mobile-only.
 */
export function shouldUseRichNativeShare(opts: {
  mobile?: boolean;
  userAgent?: string;
}): boolean {
  if (typeof opts.mobile === "boolean") return opts.mobile;
  return /Android|iPhone|iPad|iPod/i.test(opts.userAgent ?? "");
}

/** Absolute image URL for Open Graph / share previews. */
export function absoluteShareImageUrl(
  imageUrl: string | null | undefined,
  origin: string,
): string | undefined {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return undefined;
  return resolveShareUrl(trimmed, origin);
}
