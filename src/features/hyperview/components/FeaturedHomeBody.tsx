import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import { Style, View } from "../../../lib/hxml-comps";
import { getTodaysBookOfTheDay } from "../../app/BOTDServices";
import { getThisWeeksArtistOfTheWeek } from "../../app/AOTWServices";
import { getThisWeeksPublisherOfTheWeek } from "../../app/POTWServices";
import NewsletterCard from "./NewsletterCard";
import LazyLoader from "./LazyLoader";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles,
} from "./SecondaryButtonLink";
import FeaturedSpotlightCarousel, {
  featuredSpotlightCarouselStyles,
} from "./FeaturedSpotlightCarousel";
import { trendingCreatorsStyles } from "./TrendingCreatorsSlider";
import { getSpotlightItems } from "../lib/utils";
import { toWeekString, toWeekStart } from "../../../lib/utils";
import { storesSectionStyles } from "./StoresSection";

type Props = {
  baseUrl: string;
  user?: AuthUser | null;
};

const FeaturedHomeBody: FC<Props> = async ({ baseUrl }) => {
  const [
    [botdErr, botdData],
    [artistErr, artistData],
    [publisherErr, publisherData],
  ] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);

  const spotlightItems = getSpotlightItems(
    botdErr ? null : botdData,
    artistErr ? null : artistData,
    publisherErr ? null : publisherData,
    baseUrl,
  );

  const weekStart = toWeekStart(new Date());
  const thisWeekHref = `${baseUrl}/hyperview/this-week?week=${toWeekString(weekStart)}`;

  return (
    <View style="featured-home-body">
      <FeaturedSpotlightCarousel items={spotlightItems} />
      <SecondaryButtonLink label="View this week →" href={thisWeekHref} />
      <LazyLoader
        id="interviews-loader"
        href={`${baseUrl}/hyperview/featured/tab/interviews`}
        style="featured-tab-loader"
      />
      <LazyLoader
        id="trending-creators-loader"
        href={`${baseUrl}/hyperview/featured/tab/trending-creators`}
        style="featured-tab-loader"
      />
      <NewsletterCard baseUrl={baseUrl} />
      <LazyLoader
        id="latest-books-loader"
        href={`${baseUrl}/hyperview/featured/tab/latest-books`}
        style="featured-tab-loader"
      />
      <LazyLoader
        id="fairs-loader"
        href={`${baseUrl}/hyperview/featured/tab/fairs`}
        style="featured-tab-loader"
      />
      <LazyLoader
        id="stores-loader"
        href={`${baseUrl}/hyperview/featured/tab/stores`}
        style="featured-tab-loader"
      />
    </View>
  );
};

export default FeaturedHomeBody;

export const featuredHomeBodyStyles = () => (
  <>
    <Style id="featured-home-body" flexDirection="column" gap={16} />
    <Style
      id="featured-tab-loader"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={120}
      paddingTop={24}
      paddingBottom={24}
    />
    {featuredSpotlightCarouselStyles()}
    {secondaryButtonLinkStyles()}
    {trendingCreatorsStyles()}
    {storesSectionStyles()}
  </>
);
