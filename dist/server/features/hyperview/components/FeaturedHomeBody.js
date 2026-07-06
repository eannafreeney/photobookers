import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, View } from "../../../lib/hxml-comps.js";
import { getTodaysBookOfTheDay } from "../../app/BOTDServices.js";
import { getThisWeeksArtistOfTheWeek } from "../../app/AOTWServices.js";
import { getThisWeeksPublisherOfTheWeek } from "../../app/POTWServices.js";
import NewsletterCard from "./NewsletterCard.js";
import LazyLoader from "./LazyLoader.js";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles
} from "./SecondaryButtonLink.js";
import FeaturedSpotlightCarousel, {
  featuredSpotlightCarouselStyles
} from "./FeaturedSpotlightCarousel.js";
import { trendingCreatorsStyles } from "./TrendingCreatorsSlider.js";
import { getSpotlightItems } from "../lib/utils.js";
import { toWeekString, toWeekStart } from "../../../lib/utils.js";
import { storesSectionStyles } from "./StoresSection.js";
const FeaturedHomeBody = async ({ baseUrl }) => {
  const [
    [botdErr, botdData],
    [artistErr, artistData],
    [publisherErr, publisherData]
  ] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek()
  ]);
  const spotlightItems = getSpotlightItems(
    botdErr ? null : botdData,
    artistErr ? null : artistData,
    publisherErr ? null : publisherData,
    baseUrl
  );
  const weekStart = toWeekStart(/* @__PURE__ */ new Date());
  const thisWeekHref = `${baseUrl}/hyperview/this-week?week=${toWeekString(weekStart)}`;
  return /* @__PURE__ */ jsxs(View, { style: "featured-home-body", children: [
    /* @__PURE__ */ jsx(FeaturedSpotlightCarousel, { items: spotlightItems }),
    /* @__PURE__ */ jsx(SecondaryButtonLink, { label: "View this week \u2192", href: thisWeekHref }),
    /* @__PURE__ */ jsx(
      LazyLoader,
      {
        id: "groups-loader",
        href: `${baseUrl}/hyperview/featured/tab/groups`,
        style: "featured-tab-loader"
      }
    ),
    /* @__PURE__ */ jsx(NewsletterCard, { baseUrl }),
    /* @__PURE__ */ jsx(
      LazyLoader,
      {
        id: "trending-creators-loader",
        href: `${baseUrl}/hyperview/featured/tab/trending-creators`,
        style: "featured-tab-loader"
      }
    ),
    /* @__PURE__ */ jsx(
      LazyLoader,
      {
        id: "interviews-loader",
        href: `${baseUrl}/hyperview/featured/tab/interviews`,
        style: "featured-tab-loader"
      }
    ),
    /* @__PURE__ */ jsx(
      LazyLoader,
      {
        id: "latest-books-loader",
        href: `${baseUrl}/hyperview/featured/tab/latest-books`,
        style: "featured-tab-loader"
      }
    ),
    /* @__PURE__ */ jsx(
      LazyLoader,
      {
        id: "fairs-loader",
        href: `${baseUrl}/hyperview/featured/tab/fairs`,
        style: "featured-tab-loader"
      }
    ),
    /* @__PURE__ */ jsx(
      LazyLoader,
      {
        id: "stores-loader",
        href: `${baseUrl}/hyperview/featured/tab/stores`,
        style: "featured-tab-loader"
      }
    )
  ] });
};
var FeaturedHomeBody_default = FeaturedHomeBody;
const featuredHomeBodyStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "featured-home-body", flexDirection: "column", gap: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "featured-tab-loader",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 120,
      paddingTop: 24,
      paddingBottom: 24
    }
  ),
  featuredSpotlightCarouselStyles(),
  secondaryButtonLinkStyles(),
  trendingCreatorsStyles(),
  storesSectionStyles()
] });
export {
  FeaturedHomeBody_default as default,
  featuredHomeBodyStyles
};
