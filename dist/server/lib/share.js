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
export {
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
  resolveShareUrl
};
