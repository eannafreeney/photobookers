import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import HeroCarousel from "../../components/app/HeroCarousel";
import SiteFeatures from "../../features/app/components/SiteFeatures";
import Intersector from "../../features/app/components/Intersector";
import NewsletterBanner from "../../features/app/components/NewsletterBanner";
import NewsletterCard from "../../features/app/components/NewsletterCard";
import DiscoveryTags from "../../features/app/components/DiscoveryTags";
import ScrollReveal from "../../components/app/ScrollReveal";
import Interviews from "../../features/app/components/Interviews";
import { canonicalUrl, DEFAULT_DESCRIPTION, pageTitle } from "../../lib/seo";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  const title = pageTitle("Featured");
  const description = DEFAULT_DESCRIPTION;

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/featured")}
      user={user}
      currentPath={currentPath}
    >
      <NewsletterBanner />
      <Page>
        <HeroCarousel />
        <Slogan />
        <ScrollReveal>
          <Intersector id="stats-fragment" endpoint="/fragments/stats" />
        </ScrollReveal>
        <ScrollReveal>
          <SiteFeatures />
        </ScrollReveal>
        <ScrollReveal>
          <Interviews />
        </ScrollReveal>
        <ScrollReveal>
          <Intersector
            id="creators-slider-fragment"
            endpoint="/fragments/creators-slider"
          />
        </ScrollReveal>
        <ScrollReveal>
          <NewsletterCard />
        </ScrollReveal>
        <ScrollReveal>
          <Intersector
            id="latest-books-fragment"
            endpoint="/fragments/latest-books"
          />
        </ScrollReveal>
      </Page>
    </AppLayout>,
  );
});

const Slogan = () => (
  <div class="flex flex-col items-center gap-4 py-8 text-center border-y border-outline">
    <span class="kicker text-accent">Photobookers</span>
    <div class="font-display text-3xl md:text-5xl font-medium text-on-surface-strong text-balance leading-tight">
      The{" "}
      <span
        x-data={`{
              words: ['community', 'social network', 'archive', 'home'],
              current: 0,
              visible: true,
               init() {
                setInterval(() => {
                  this.visible = false
                  setTimeout(() => {
                    this.current = (this.current + 1) % this.words.length
                    this.visible = true
                  }, 300)
                }, 2500)
              }
            }`}
        x-text="words[current]"
        x-bind:class="visible ? 'opacity-100' : 'opacity-0'"
        class="border-b-2 border-accent inline-block transition-opacity duration-300 italic"
      />{" "}
      for photobook lovers.
    </div>
    <p class="max-w-xl text-sm md:text-base text-on-surface text-pretty">
      Browse a growing archive of photobooks, follow the artists and publishers
      behind them, and never miss a new release.
    </p>
  </div>
);
