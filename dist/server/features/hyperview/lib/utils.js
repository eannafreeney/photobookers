import { aotwPath, botdPath, potwPath } from "../../app/spotlightUrls.js";
const getSpotlightItems = (botdResult, artistResult, publisherResult, baseUrl) => {
  const spotlightItems = [];
  if (botdResult?.book) {
    spotlightItems.push({
      id: `botd-${botdResult.id}`,
      label: "Book of the Day",
      title: botdResult.book.title,
      imageUrl: botdResult.book.coverUrl,
      href: `${baseUrl}/hyperview${botdPath(botdResult.date)}`
    });
  }
  if (artistResult?.creator) {
    const { creator } = artistResult;
    spotlightItems.push({
      id: `aotw-${artistResult.id}`,
      label: "Artist of the Week",
      title: creator.displayName,
      imageUrl: artistResult.instagramImageUrl ?? creator.coverUrl ?? creator.bannerUrl ?? null,
      href: `${baseUrl}/hyperview${aotwPath(artistResult.weekStart)}`
    });
  }
  if (publisherResult?.creator) {
    const { creator } = publisherResult;
    spotlightItems.push({
      id: `potw-${publisherResult.id}`,
      label: "Publisher of the Week",
      title: creator.displayName,
      imageUrl: publisherResult.instagramImageUrl ?? creator.coverUrl ?? creator.bannerUrl ?? null,
      href: `${baseUrl}/hyperview${potwPath(publisherResult.weekStart)}`
    });
  }
  return spotlightItems;
};
export {
  getSpotlightItems
};
