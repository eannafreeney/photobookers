import { BookOfTheDayWithBook } from "../../app/BOTDServices";
import { ArtistOfTheWeekWithCreator } from "../../app/AOTWServices";
import { PublisherOfTheWeekWithCreator } from "../../app/POTWServices";
import { FeaturedSpotlightItem } from "../components/FeaturedSpotlightCarousel";
import { aotwPath, botdPath, potwPath } from "../../app/spotlightUrls";

export const getSpotlightItems = (
  botdResult: BookOfTheDayWithBook | null,
  artistResult: ArtistOfTheWeekWithCreator,
  publisherResult: PublisherOfTheWeekWithCreator,
  baseUrl: string,
) => {
  const spotlightItems: FeaturedSpotlightItem[] = [];

  if (botdResult?.book) {
    spotlightItems.push({
      id: `botd-${botdResult.id}`,
      label: "Book of the Day",
      title: botdResult.book.title,
      imageUrl: botdResult.book.coverUrl,
      href: `${baseUrl}/hyperview${botdPath(botdResult.date)}`,
    });
  }

  if (artistResult?.creator) {
    const { creator } = artistResult;
    spotlightItems.push({
      id: `aotw-${artistResult.id}`,
      label: "Artist of the Week",
      title: creator.displayName,
      imageUrl:
        artistResult.instagramImageUrl ??
        creator.coverUrl ??
        creator.bannerUrl ??
        null,
      href: `${baseUrl}/hyperview${aotwPath(artistResult.weekStart)}`,
    });
  }

  if (publisherResult?.creator) {
    const { creator } = publisherResult;
    spotlightItems.push({
      id: `potw-${publisherResult.id}`,
      label: "Publisher of the Week",
      title: creator.displayName,
      imageUrl:
        publisherResult.instagramImageUrl ??
        creator.coverUrl ??
        creator.bannerUrl ??
        null,
      href: `${baseUrl}/hyperview${potwPath(publisherResult.weekStart)}`,
    });
  }

  return spotlightItems;
};
