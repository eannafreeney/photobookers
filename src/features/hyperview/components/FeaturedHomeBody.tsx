import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import { Style, View } from "../../../lib/hxml-comps";
import { getTodaysBookOfTheDay } from "../../app/BOTDServices";
import { getThisWeeksArtistOfTheWeek } from "../../app/AOTWServices";
import { getThisWeeksPublisherOfTheWeek } from "../../app/POTWServices";
import NewsletterCard from "./NewsletterCard";
import LazyLoader from "./LazyLoader";
import { secondaryButtonLinkStyles } from "./SecondaryButtonLink";
import FeaturedSpotlightCarousel, {
  featuredSpotlightCarouselStyles,
} from "./FeaturedSpotlightCarousel";
import { trendingCreatorsStyles } from "./TrendingCreatorsSlider";
import { getSpotlightItems } from "../lib/utils";
import { storesSectionStyles } from "./StoresSection";
import HomepageActivityPulse, {
  homepageActivityPulseStyles,
} from "./HomepageActivityPulse";
import { getHomepageActivityStats } from "../../app/homepageActivity";

type Props = {
  baseUrl: string;
  user?: AuthUser | null;
};

const FeaturedHomeBody = async ({ baseUrl }: Props) => {
  const [
    [botdErr, botdData],
    [artistErr, artistData],
    [publisherErr, publisherData],
    [activityError, activity],
  ] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
    getHomepageActivityStats(),
  ]);

  const spotlightItems = getSpotlightItems(
    botdErr ? null : botdData,
    artistErr ? null : artistData,
    publisherErr ? null : publisherData,
    baseUrl,
  );

  return (
    <View style="featured-home-body">
      {!activityError && activity ? (
        <HomepageActivityPulse
          bookViews={activity.bookViews}
          profileViews={activity.profileViews}
        />
      ) : null}
      <FeaturedSpotlightCarousel items={spotlightItems} />
      <LazyLoader
        id="groups-loader"
        href={`${baseUrl}/hyperview/featured/tab/groups`}
        style="featured-tab-loader"
      />
      <NewsletterCard baseUrl={baseUrl} />
      <LazyLoader
        id="trending-creators-loader"
        href={`${baseUrl}/hyperview/featured/tab/trending-creators`}
        style="featured-tab-loader"
      />
      <LazyLoader
        id="interviews-loader"
        href={`${baseUrl}/hyperview/featured/tab/interviews`}
        style="featured-tab-loader"
      />
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
    {homepageActivityPulseStyles()}
    {featuredSpotlightCarouselStyles()}
    {secondaryButtonLinkStyles()}
    {trendingCreatorsStyles()}
    {storesSectionStyles()}
  </>
);
