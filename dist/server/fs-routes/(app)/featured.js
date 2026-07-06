import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import HeroCarouselFeatureCard from "../../components/app/HeroCarouselFeatureCard.js";
import SiteFeatures from "../../features/app/components/SiteFeatures.js";
import Intersector from "../../features/app/components/Intersector.js";
import NewsletterBanner from "../../features/app/components/NewsletterBanner.js";
import NewsletterCard from "../../features/app/components/NewsletterCard.js";
import ScrollReveal from "../../components/app/ScrollReveal.js";
import Interviews from "../../features/app/components/Interviews.js";
import FeaturedBookGroups from "../../features/app/components/FeaturedBookGroups.js";
import { canonicalUrl, DEFAULT_DESCRIPTION, pageTitle } from "../../lib/seo.js";
import { loadHeroCarouselFeatureItems } from "../../features/app/utils.js";
import { heroLcpImageSources } from "../../lib/imageUrl.js";
import ThisWeekOnPhotobookersLink from "../../features/app/components/ThisWeekOnPhotobookersLink.js";
import PageBleed from "../../components/layouts/PageBleedRight.js";
import { getHomepageActivityStats } from "../../features/app/homepageActivity.js";
import HomepageActivityPulse from "../../features/app/components/HomepageActivityPulse.js";
const GET = createRoute(async (c) => {
  const [user, heroItems] = await Promise.all([
    getUser(c),
    loadHeroCarouselFeatureItems()
  ]);
  const currentPath = c.req.path;
  const lcpImage = heroItems[0]?.image ? heroLcpImageSources(heroItems[0].image) : void 0;
  const title = pageTitle("Featured");
  const description = DEFAULT_DESCRIPTION;
  return c.html(
    /* @__PURE__ */ jsxs(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/featured"),
        user,
        currentPath,
        preloadLcpImage: lcpImage,
        children: [
          /* @__PURE__ */ jsx(NewsletterBanner, {}),
          /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx(Pulse, {}),
            /* @__PURE__ */ jsx(HeroCarouselFeatureCard, { heroItems }),
            /* @__PURE__ */ jsx(ThisWeekOnPhotobookersLink, {}),
            /* @__PURE__ */ jsx(Slogan, {}),
            !user && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(Intersector, { id: "stats-fragment", endpoint: "/fragments/stats" }) }),
              /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(SiteFeatures, {}) })
            ] }),
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsx(FeaturedBookGroups, {}) }) }),
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(NewsletterCard, {}) }),
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsx(
              Intersector,
              {
                id: "creators-slider-fragment",
                endpoint: "/fragments/creators-slider"
              }
            ) }) }),
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(PageBleed, { children: /* @__PURE__ */ jsx(Interviews, {}) }) }),
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
              Intersector,
              {
                id: "latest-books-fragment",
                endpoint: "/fragments/latest-books"
              }
            ) }),
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(Intersector, { id: "fairs-fragment", endpoint: "/fragments/fairs" }) }),
            /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(Intersector, { id: "stores-fragment", endpoint: "/fragments/stores" }) })
          ] })
        ]
      }
    )
  );
});
const Slogan = () => /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-4 py-8 text-center border-y border-outline", children: [
  /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Photobookers" }),
  /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl md:text-5xl font-medium text-on-surface-strong text-balance leading-tight max-w-3xl", children: "Every photobook, artist, and publisher \u2014 in one place." }),
  /* @__PURE__ */ jsx("p", { class: "max-w-xl text-sm md:text-base text-on-surface text-pretty", children: "Browse a growing archive of photobooks, follow the artists and publishers behind them, and never miss a new release." })
] });
const Pulse = async () => {
  const [error, activity] = await getHomepageActivityStats();
  if (error || !activity) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(
    HomepageActivityPulse,
    {
      bookViews: activity.bookViews,
      profileViews: activity.profileViews
    }
  );
};
export {
  GET
};
