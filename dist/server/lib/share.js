import { creatorUrl } from "../features/app/spotlightUrls.js";
function creatorProfileUrl(slug) {
  return creatorUrl(slug);
}
function creatorVerifiedSharePost(creator) {
  const label = creator.type === "publisher" ? "publisher" : "artist";
  const profileUrl = creatorProfileUrl(creator.slug);
  return `I'm on Photobookers \u2014 a place to discover photobooks and follow the artists and publishers behind them.
Find my ${label} profile and books here:
${profileUrl}`;
}
function creatorVerifiedSharePostHtml(creator) {
  const post = creatorVerifiedSharePost(creator);
  return `<pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f5;padding:12px;border-radius:4px">${post.replace(/</g, "&lt;")}</pre>`;
}
function bookShareTitle(book) {
  if (book.artist?.displayName) {
    return `${book.title} by ${book.artist.displayName}`;
  }
  return book.title;
}
function bookShareText(book) {
  return `${bookShareTitle(book)} \u2014 on Photobookers`;
}
function bookLiveInstagramCaption(params) {
  const byArtist = params.artistName ? ` by ${params.artistName}` : "";
  const intro = params.addedBy === "contributor" ? `I added book "${params.bookTitle}"${byArtist} \u2014 live on @photobookers.` : `My book "${params.bookTitle}"${byArtist} is live on @photobookers.`;
  const lines = [
    intro,
    "",
    params.bookUrl
  ];
  const handle = params.instagram?.trim();
  if (handle) {
    const normalized = handle.startsWith("@") ? handle : `@${handle}`;
    lines.push("", normalized);
  }
  lines.push("", "#photobook #photobookjousting");
  return lines.join("\n");
}
function listPath(shelfSlug, listSlug) {
  return `/shelf/${shelfSlug}/lists/${listSlug}`;
}
function listShareTitle(listTitle) {
  return listTitle;
}
function listShareText(listTitle, ownerName) {
  return `${listTitle} \u2014 a photobook list by ${ownerName} on Photobookers`;
}
function postPath(postId) {
  return `/posts/${postId}`;
}
function postUrl(postId, siteUrl) {
  const base = (siteUrl ?? process.env.SITE_URL ?? "https://photobookers.com").replace(
    /\/$/,
    ""
  );
  return `${base}${postPath(postId)}`;
}
function postShareText(authorName) {
  return `Post by ${authorName} on Photobookers`;
}
function bookOfTheDayShareTitle(book) {
  return `Book of the Day \u2014 ${book.title}`;
}
function bookOfTheDayShareText(book) {
  const byArtist = book.artist?.displayName ? ` by ${book.artist.displayName}` : "";
  return `${book.title}${byArtist} \u2014 featured on Photobookers`;
}
function creatorShareText(creator) {
  const label = creator.type === "publisher" ? "publisher" : "artist";
  return `${creator.displayName} \u2014 ${label} on Photobookers`;
}
function shelfProfileUrl(slug) {
  return `/shelf/${slug}`;
}
function shelfShareTitle(ownerName) {
  return `${ownerName}'s shelf`;
}
function shelfShareText(ownerName) {
  return `${ownerName}'s favorite photobooks on Photobookers`;
}
function creatorOfTheWeekShareTitle(creator, role) {
  return `${role} of the Week \u2014 ${creator.displayName}`;
}
function creatorOfTheWeekShareText(creator, role) {
  return `${creator.displayName} is ${role} of the Week on Photobookers`;
}
function resolveShareUrl(url, origin) {
  const trimmed = url?.trim();
  if (!trimmed) return origin;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return new URL(trimmed, origin).href;
}
function nativeSharePayload(title, text, url) {
  return { title, text: `${text}
${url}` };
}
function shouldUseRichNativeShare(opts) {
  if (typeof opts.mobile === "boolean") return opts.mobile;
  return /Android|iPhone|iPad|iPod/i.test(opts.userAgent ?? "");
}
function absoluteShareImageUrl(imageUrl, origin) {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return void 0;
  return resolveShareUrl(trimmed, origin);
}
export {
  absoluteShareImageUrl,
  bookLiveInstagramCaption,
  bookOfTheDayShareText,
  bookOfTheDayShareTitle,
  bookShareText,
  bookShareTitle,
  creatorOfTheWeekShareText,
  creatorOfTheWeekShareTitle,
  creatorProfileUrl,
  creatorShareText,
  creatorVerifiedSharePost,
  creatorVerifiedSharePostHtml,
  listPath,
  listShareText,
  listShareTitle,
  nativeSharePayload,
  postPath,
  postShareText,
  postUrl,
  resolveShareUrl,
  shelfProfileUrl,
  shelfShareText,
  shelfShareTitle,
  shouldUseRichNativeShare
};
