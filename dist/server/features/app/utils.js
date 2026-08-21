import {
  getBookOfTheDayForDate,
  getTodaysBookOfTheDay
} from "./BOTDServices.js";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek
} from "./CreatorSpotlightServices.js";
import { getSpotlightCatalogueBooks } from "./services.js";
import { aotwPath, potwPath } from "./spotlightUrls.js";
async function heroCarouselCoverStack(role, creatorId) {
  if (!creatorId) return [];
  const [coverErr, catalogue] = await getSpotlightCatalogueBooks(
    role,
    creatorId
  );
  return !coverErr && catalogue ? catalogue : [];
}
async function loadHeroCarouselCoverStacks(params) {
  const [publisherCoverStack, artistCoverStack] = await Promise.all([
    heroCarouselCoverStack("publisher", params.publisherCreatorId),
    heroCarouselCoverStack("artist", params.artistCreatorId)
  ]);
  return { publisherCoverStack, artistCoverStack };
}
function buildCreatorOfTheWeekSpotlight(role, data, coverStack) {
  const creator = data?.creator;
  if (!data || !creator) return null;
  return {
    role,
    creator: {
      id: creator.id,
      displayName: creator.displayName,
      slug: creator.slug,
      coverUrl: creator.coverUrl ?? null,
      country: creator.country ?? null,
      tagline: creator.tagline ?? null
    },
    featuredImageUrl: data.featuredImageUrl ?? null,
    coverStack,
    spotlightBlurb: data.spotlightBlurb ?? null,
    link: role === "artist" ? aotwPath(data.weekStart) : potwPath(data.weekStart)
  };
}
async function loadCreatorsOfTheWeek() {
  const [[artistErr, artistOfTheWeek], [publisherErr, publisherOfTheWeek]] = await Promise.all([
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek()
  ]);
  const artist = artistErr ? null : artistOfTheWeek;
  const publisher = publisherErr ? null : publisherOfTheWeek;
  const { publisherCoverStack, artistCoverStack } = await loadHeroCarouselCoverStacks({
    publisherCreatorId: publisher ? publisher.creatorId : null,
    artistCreatorId: artist ? artist.creatorId : null
  });
  return {
    artist: buildCreatorOfTheWeekSpotlight("artist", artist, artistCoverStack),
    publisher: buildCreatorOfTheWeekSpotlight(
      "publisher",
      publisher,
      publisherCoverStack
    )
  };
}
async function loadBookOfTheDayFeature() {
  const yesterdayDate = /* @__PURE__ */ new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const twoDaysAgoDate = /* @__PURE__ */ new Date();
  twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
  const threeDaysAgoDate = /* @__PURE__ */ new Date();
  threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
  const [[todayErr, today], [, yesterday], [, twoDaysAgo], [, threeDaysAgo]] = await Promise.all([
    getTodaysBookOfTheDay(),
    getBookOfTheDayForDate(yesterdayDate),
    getBookOfTheDayForDate(twoDaysAgoDate),
    getBookOfTheDayForDate(threeDaysAgoDate)
  ]);
  return {
    today: todayErr || !today?.book ? null : today,
    yesterday: yesterday?.book ? yesterday : null,
    twoDaysAgo: twoDaysAgo?.book ? twoDaysAgo : null,
    threeDaysAgo: threeDaysAgo?.book ? threeDaysAgo : null
  };
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
  buildCreatorOfTheWeekSpotlight,
  getImageSizeClass,
  loadBookOfTheDayFeature,
  loadCreatorsOfTheWeek,
  loadHeroCarouselCoverStacks
};
