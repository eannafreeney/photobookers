import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser, getFlash } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import SiteFeatures from "../../features/app/components/SiteFeatures.js";
import Intersector from "../../features/app/components/Intersector.js";
import NewsletterCard from "../../features/app/components/NewsletterCard.js";
import ScrollReveal from "../../components/app/ScrollReveal.js";
import FeaturedBookGroups from "../../features/app/components/FeaturedBookGroups.js";
import { canonicalUrl, DEFAULT_DESCRIPTION, pageTitle } from "../../lib/seo.js";
import {
  loadBookOfTheDayFeature,
  loadCreatorsOfTheWeek
} from "../../features/app/utils.js";
import { heroLcpImageSources } from "../../lib/imageUrl.js";
import PageBleed from "../../components/layouts/PageBleedRight.js";
import { getHomepageActivityStats } from "../../features/app/homepageActivity.js";
import BookOfTheDayAnchor from "../../features/app/components/BookOfTheDayAnchor.js";
import CreatorOfTheWeekSpotlight from "../../features/app/components/CreatorOfTheWeekSpotlight.js";
import DiscoveryTagChips from "../../features/app/components/DiscoveryTagChips.js";
import SectionSkeleton from "../../features/app/components/SectionSkeleton.js";
import { getRecentPublicActivityPage } from "../../features/app/homepageRecentActivity.js";
import HomepageRecentActivity from "../../features/app/components/HomepageRecentActivity.js";
const GET = createRoute(async (c) => {
  const [user, bookOfTheDay, flash] = await Promise.all([
    getUser(c),
    loadBookOfTheDayFeature(),
    getFlash(c)
  ]);
  const currentPath = c.req.path;
  const lcpSource = bookOfTheDay.today?.featuredImageUrl ?? bookOfTheDay.today?.book.coverUrl ?? null;
  const lcpImage = lcpSource ? heroLcpImageSources(lcpSource) : void 0;
  const title = pageTitle("Discover Photobooks from Artists & Publishers");
  const description = DEFAULT_DESCRIPTION;
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/featured"),
        user,
        currentPath,
        preloadLcpImage: lcpImage,
        flash,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          bookOfTheDay.today ? /* @__PURE__ */ jsx(
            BookOfTheDayAnchor,
            {
              today: bookOfTheDay.today,
              yesterday: bookOfTheDay.yesterday,
              twoDaysAgo: bookOfTheDay.twoDaysAgo,
              threeDaysAgo: bookOfTheDay.threeDaysAgo,
              user
            }
          ) : null,
          /* @__PURE__ */ jsx(Slogan, {}),
          /* @__PURE__ */ jsx(DiscoveryTagChips, {}),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(RecentActivity, { user }) }),
          !user && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(Intersector, { id: "stats-fragment", endpoint: "/fragments/stats", children: /* @__PURE__ */ jsx(SectionSkeleton, { variant: "stats", withHeader: false }) }) }),
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(SiteFeatures, {}) })
          ] }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(NewsletterCard, {}) }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsx(FeaturedBookGroups, {}) }) }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(CreatorsOfTheWeek, { user }) }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
            Intersector,
            {
              id: "creators-slider-fragment",
              endpoint: "/fragments/creators-slider",
              children: /* @__PURE__ */ jsx(SectionSkeleton, { variant: "circles" })
            }
          ) }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
            Intersector,
            {
              id: "interviews-fragment",
              endpoint: "/fragments/interviews",
              children: /* @__PURE__ */ jsx(SectionSkeleton, { variant: "spread" })
            }
          ) }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsx(Intersector, { id: "lists-fragment", endpoint: "/fragments/lists", children: /* @__PURE__ */ jsx(SectionSkeleton, { variant: "cards" }) }) }) }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
            Intersector,
            {
              id: "latest-books-fragment",
              endpoint: "/fragments/latest-books",
              children: /* @__PURE__ */ jsx(SectionSkeleton, { variant: "grid" })
            }
          ) }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(Intersector, { id: "fairs-fragment", endpoint: "/fragments/fairs", children: /* @__PURE__ */ jsx(SectionSkeleton, { variant: "rows" }) }) }),
          /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(Intersector, { id: "stores-fragment", endpoint: "/fragments/stores", children: /* @__PURE__ */ jsx(SectionSkeleton, { variant: "columns" }) }) })
        ] })
      }
    )
  );
});
const Slogan = () => /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-4 border-t-2 border-on-surface-strong py-8 pt-6 text-center", children: [
  /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Photobookers" }),
  /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl md:text-5xl font-medium text-on-surface-strong text-balance leading-tight max-w-3xl", children: "Every photobook, artist, and publisher \u2014 in one place." }),
  /* @__PURE__ */ jsx("p", { class: "max-w-xl text-sm md:text-base text-on-surface text-pretty", children: "Browse a growing archive of photobooks, follow the artists and publishers behind them, and never miss a new release." })
] });
const CreatorsOfTheWeek = async ({ user }) => {
  const { artist, publisher } = await loadCreatorsOfTheWeek();
  if (!artist && !publisher) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { class: "grid items-start gap-8 py-4 md:grid-cols-2 md:gap-10", children: [
    artist ? /* @__PURE__ */ jsx(CreatorOfTheWeekSpotlight, { spotlight: artist, user }) : null,
    publisher ? /* @__PURE__ */ jsx(CreatorOfTheWeekSpotlight, { spotlight: publisher, user }) : null
  ] });
};
const RecentActivity = async ({ user }) => {
  const [[error, page], [statsError, stats]] = await Promise.all([
    getRecentPublicActivityPage(),
    getHomepageActivityStats()
  ]);
  if (error || !page?.items.length) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(
    HomepageRecentActivity,
    {
      items: page.items,
      currentUserId: user?.id,
      hasMore: page.hasMore,
      nextOffset: page.nextOffset,
      pageSize: page.pageSize,
      stats: statsError ? null : stats
    }
  );
};
export {
  GET
};
