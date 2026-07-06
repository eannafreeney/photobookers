import { toDateString, toWeekString } from "../../lib/utils.js";
function appBaseUrl() {
  if (typeof process !== "undefined" && process.env.PUBLIC_APP_URL) {
    return process.env.PUBLIC_APP_URL;
  }
  return "https://www.photobookers.com";
}
function bookPath(slug) {
  return `/books/${slug}`;
}
function creatorPath(slug) {
  return `/creators/${slug}`;
}
function bookUrl(slug) {
  return `${appBaseUrl()}${bookPath(slug)}`;
}
function creatorUrl(slug) {
  return `${appBaseUrl()}${creatorPath(slug)}`;
}
function fairPath(slug) {
  return `/fairs/${slug}`;
}
function fairUrl(slug) {
  return `${appBaseUrl()}${fairPath(slug)}`;
}
function botdIndexPath() {
  return "/book-of-the-day";
}
function cotwIndexPath(isArtist) {
  return isArtist ? "/artist-of-the-week" : "/publisher-of-the-week";
}
function botdPath(date) {
  return `${botdIndexPath()}/${toDateString(date)}`;
}
function aotwPath(weekStart) {
  return `/artist-of-the-week/${toWeekString(weekStart)}`;
}
function potwPath(weekStart) {
  return `/publisher-of-the-week/${toWeekString(weekStart)}`;
}
function botdUrl(date) {
  return `${appBaseUrl()}${botdPath(date)}`;
}
function aotwUrl(weekStart) {
  return `${appBaseUrl()}${aotwPath(weekStart)}`;
}
function potwUrl(weekStart) {
  return `${appBaseUrl()}${potwPath(weekStart)}`;
}
function thisWeekPath(weekStart) {
  const qs = weekStart ? `?week=${toWeekString(weekStart)}` : "";
  return `/this-week${qs}`;
}
function thisWeekUrl(weekStart) {
  return `${appBaseUrl()}${thisWeekPath(weekStart)}`;
}
function linksPath() {
  return "/links";
}
function linksUrl() {
  return `${appBaseUrl()}${linksPath()}`;
}
export {
  aotwPath,
  aotwUrl,
  bookPath,
  bookUrl,
  botdIndexPath,
  botdPath,
  botdUrl,
  cotwIndexPath,
  creatorPath,
  creatorUrl,
  fairPath,
  fairUrl,
  linksPath,
  linksUrl,
  potwPath,
  potwUrl,
  thisWeekPath,
  thisWeekUrl
};
