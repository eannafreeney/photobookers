import { formatCountry, toDateString } from "../../lib/utils.js";
import { getWeekNumber } from "../dashboard/admin/planner/utils.js";
import { getTodaysBookOfTheDay } from "./BOTDServices.js";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek
} from "./CreatorSpotlightServices.js";
import { getCoverUrlsForHeroCarousel } from "./services.js";
import { aotwPath, botdPath, potwPath } from "./spotlightUrls.js";
async function heroCarouselCoverStack(role, creatorId) {
  if (!creatorId) return [];
  const [coverErr, urls] = await getCoverUrlsForHeroCarousel(role, creatorId);
  return !coverErr && urls ? urls : [];
}
async function loadHeroCarouselCoverStacks(params) {
  const [publisherCoverStack, artistCoverStack] = await Promise.all([
    heroCarouselCoverStack("publisher", params.publisherCreatorId),
    heroCarouselCoverStack("artist", params.artistCreatorId)
  ]);
  return { publisherCoverStack, artistCoverStack };
}
function buildHeroCarouselItems(bookOfTheDay, artistOfTheWeek, publisherOfTheWeek, publisherCoverStack, artistCoverStack) {
  const weekNumber = bookOfTheDay ? getWeekNumber(bookOfTheDay.date) : null;
  const items = [];
  const book = bookOfTheDay?.book;
  if (book) {
    const imageUrls = [
      book.coverUrl,
      ...book.images?.map((img) => img.imageUrl) ?? []
    ].filter((url) => Boolean(url));
    items.push({
      label: "Book of the Day",
      title: book.title,
      text: book.artist ? `by ${book.artist.displayName}` : "",
      image: bookOfTheDay.instagramImageUrl ?? imageUrls[0],
      link: botdPath(bookOfTheDay.date),
      slideClass: "bg-[#f2efe8]",
      weekNumber,
      dateLabel: toDateString(bookOfTheDay.date)
    });
  }
  const artist = artistOfTheWeek?.creator;
  if (artist) {
    const heroImage = artistOfTheWeek.instagramImageUrl ?? artist.coverUrl ?? void 0;
    const stack = heroImage || artistCoverStack.length < 2 ? [] : artistCoverStack;
    items.push({
      label: "Artist of the Week",
      title: artist.displayName,
      image: heroImage,
      coverStack: stack,
      text: artist.country?.trim() ? `Based in ${formatCountry(artist.country.trim())}` : "Discover this week's featured artist.",
      link: aotwPath(artistOfTheWeek.weekStart),
      slideClass: "bg-[#e8e9e2]",
      weekNumber
    });
  }
  const publisher = publisherOfTheWeek?.creator;
  if (publisher) {
    const heroImage = publisherOfTheWeek.instagramImageUrl ?? publisher.coverUrl ?? void 0;
    const stack = heroImage || publisherCoverStack.length < 2 ? [] : publisherCoverStack;
    items.push({
      label: "Publisher of the Week",
      title: publisher.displayName,
      image: heroImage,
      coverStack: stack,
      link: potwPath(publisherOfTheWeek.weekStart),
      text: publisher.country?.trim() ? `Based in ${formatCountry(publisher.country.trim())}` : "Discover this week's featured publisher.",
      slideClass: "bg-[#efe5e0]",
      weekNumber
    });
  }
  return items;
}
async function loadHeroCarouselFeatureItems() {
  const [bookRes, artistRes, publisherRes] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek()
  ]);
  const [bookErr, bookOfTheDay] = bookRes;
  const [artistErr, artistOfTheWeek] = artistRes;
  const [publisherErr, publisherOfTheWeek] = publisherRes;
  if (artistErr || publisherErr) {
    return [];
  }
  const { publisherCoverStack, artistCoverStack } = await loadHeroCarouselCoverStacks({
    publisherCreatorId: publisherOfTheWeek ? publisherOfTheWeek.creatorId : null,
    artistCreatorId: artistOfTheWeek ? artistOfTheWeek.creatorId : null
  });
  return buildHeroCarouselItems(
    bookErr ? null : bookOfTheDay,
    artistErr ? null : artistOfTheWeek,
    publisherErr ? null : publisherOfTheWeek,
    publisherCoverStack,
    artistCoverStack
  );
}
function toAlpineDataJson(items) {
  return JSON.stringify(items).replace(/</g, "\\u003c");
}
function getImageSizeClass(size) {
  const imageSizeClass = {
    12: "size-12",
    14: "size-14",
    16: "size-16",
    20: "size-20",
    24: "size-24",
    28: "size-28",
    32: "size-32"
  }[size] ?? "size-24";
  return imageSizeClass;
}
export {
  buildHeroCarouselItems,
  getImageSizeClass,
  loadHeroCarouselCoverStacks,
  loadHeroCarouselFeatureItems,
  toAlpineDataJson
};
