import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import HeroCarouselFeatureCard from "../../components/app/HeroCarouselFeatureCard";
import SiteFeatures from "../../features/app/components/SiteFeatures";
import Intersector from "../../features/app/components/Intersector";
import NewsletterBanner from "../../features/app/components/NewsletterBanner";
import NewsletterCard from "../../features/app/components/NewsletterCard";
import ScrollReveal from "../../components/app/ScrollReveal";
import Interviews from "../../features/app/components/Interviews";
import FeaturedBookGroups from "../../features/app/components/FeaturedBookGroups";
import { canonicalUrl, DEFAULT_DESCRIPTION, pageTitle } from "../../lib/seo";
import { loadHeroCarouselFeatureItems } from "../../features/app/utils";
import { heroLcpImageSources } from "../../lib/imageUrl";
import ThisWeekOnPhotobookersLink from "../../features/app/components/ThisWeekOnPhotobookersLink";
import PageBleed from "../../components/layouts/PageBleedRight";
import { getHomepageActivityStats } from "@/features/app/homepageActivity";
import HomepageActivityPulse from "@/features/app/components/HomepageActivityPulse";

export const GET = createRoute(async (c: Context) => {
  const [user, heroItems] = await Promise.all([
    getUser(c),
    loadHeroCarouselFeatureItems(),
  ]);
  const currentPath = c.req.path;
  const lcpImage = heroItems[0]?.image
    ? heroLcpImageSources(heroItems[0].image)
    : undefined;

  const title = pageTitle("Discover Photobooks from Artists & Publishers");
  const description = DEFAULT_DESCRIPTION;

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/featured")}
      user={user}
      currentPath={currentPath}
      preloadLcpImage={lcpImage}
    >
      {/* <NewsletterBanner /> */}
      <Page>
        <Pulse />
        <HeroCarouselFeatureCard heroItems={heroItems} />
        {/* <ThisWeekOnPhotobookersLink /> */}
        <Slogan />
        {!user && (
          <>
            <ScrollReveal>
              <Intersector id="stats-fragment" endpoint="/fragments/stats" />
            </ScrollReveal>
            <ScrollReveal>
              <SiteFeatures />
            </ScrollReveal>
          </>
        )}

        <ScrollReveal>
          <PageBleed>
            <FeaturedBookGroups />
          </PageBleed>
        </ScrollReveal>
        <ScrollReveal>
          <NewsletterCard />
        </ScrollReveal>
        <ScrollReveal>
          <PageBleed>
            <Intersector
              id="creators-slider-fragment"
              endpoint="/fragments/creators-slider"
            />
          </PageBleed>
        </ScrollReveal>
        <ScrollReveal>
          <PageBleed>
            <Interviews />
          </PageBleed>
        </ScrollReveal>

        <ScrollReveal>
          <Intersector
            id="latest-books-fragment"
            endpoint="/fragments/latest-books"
          />
        </ScrollReveal>
        <ScrollReveal>
          <Intersector id="fairs-fragment" endpoint="/fragments/fairs" />
        </ScrollReveal>
        <ScrollReveal>
          <Intersector id="stores-fragment" endpoint="/fragments/stores" />
        </ScrollReveal>
      </Page>
    </AppLayout>,
  );
});

const Slogan = () => (
  <div class="flex flex-col items-center gap-4 py-8 text-center border-y border-outline">
    <span class="kicker text-accent">Photobookers</span>
    <h1 class="font-display text-3xl md:text-5xl font-medium text-on-surface-strong text-balance leading-tight max-w-3xl">
      Every photobook, artist, and publisher — in one place.
    </h1>
    <p class="max-w-xl text-sm md:text-base text-on-surface text-pretty">
      Browse a growing archive of photobooks, follow the artists and publishers
      behind them, and never miss a new release.
    </p>
  </div>
);

const Pulse = async () => {
  const [error, activity] = await getHomepageActivityStats();

  if (error || !activity) return <></>;

  return (
    <HomepageActivityPulse
      bookViews={activity.bookViews}
      profileViews={activity.profileViews}
    />
  );
};
