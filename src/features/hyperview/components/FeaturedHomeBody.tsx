import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import { Style, View } from "../../../lib/hxml-comps";
import { getTodaysBookOfTheDay } from "../../app/BOTDServices";
import { getThisWeeksArtistOfTheWeek } from "../../app/AOTWServices";
import { getThisWeeksPublisherOfTheWeek } from "../../app/POTWServices";
import NewsletterCard from "./NewsletterCard";
import LazyLoader from "./LazyLoader";
import SectionHeader from "./SectionHeader";
import {
  FeaturedLatestBooksCatalogShell,
  loadFeaturedLatestBooksCatalog,
} from "./BookGridWithFilters";
import { hyperviewBooksFilterUrl } from "../../../lib/tags";
import { botdPath, aotwPath, potwPath } from "../../app/spotlightUrls";
import { toWeekString, toWeekStart } from "../../../lib/utils";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles,
} from "./SecondaryButtonLink";
import FeaturedSpotlightCarousel, {
  type FeaturedSpotlightItem,
  featuredSpotlightCarouselStyles,
} from "./FeaturedSpotlightCarousel";

type Props = {
  baseUrl: string;
  user?: AuthUser | null;
};

const FeaturedHomeBody: FC<Props> = async ({ baseUrl, user = null }) => {
  const [
    [botdErr, botdResult],
    [artistErr, artistResult],
    [publisherErr, publisherResult],
    latestBooksCatalog,
  ] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
    loadFeaturedLatestBooksCatalog(user, baseUrl),
  ]);
  if (artistErr) return <></>;
  if (publisherErr) return <></>;

  const spotlightItems: FeaturedSpotlightItem[] = [];

  if (!botdErr && botdResult?.book) {
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

  const weekStart = toWeekStart(new Date());
  const thisWeekHref = `${baseUrl}/hyperview/this-week?week=${toWeekString(weekStart)}`;

  return (
    <View style="featured-home-body">
      <FeaturedSpotlightCarousel items={spotlightItems} />
      <SecondaryButtonLink label="View this week →" href={thisWeekHref} />
      <NewsletterCard baseUrl={baseUrl} />
      <LazyLoader
        id="interviews-fragment"
        href={`${baseUrl}/hyperview/featured/tab/interviews`}
        style="interviews-fragment"
      />
      {latestBooksCatalog ? (
        <View style="latest-books-section">
          <SectionHeader
            title="Latest Books"
            viewAllHref={hyperviewBooksFilterUrl(baseUrl, {})}
          />
          <FeaturedLatestBooksCatalogShell
            {...latestBooksCatalog}
            tag={null}
            q={null}
          />
        </View>
      ) : null}
    </View>
  );
};

export default FeaturedHomeBody;

export const featuredHomeBodyStyles = () => (
  <>
    <Style id="featured-home-body" flexDirection="column" gap={16} />
    {featuredSpotlightCarouselStyles()}
    {secondaryButtonLinkStyles()}
  </>
);
