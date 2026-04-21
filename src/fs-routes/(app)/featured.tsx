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
import PageBleed from "../../components/layouts/PageContent";
import ScrollReveal from "../../components/app/ScrollReveal";
import Interviews from "../../features/app/components/Interviews";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Books" user={user} currentPath={currentPath}>
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
            id="featured-books-fragment"
            endpoint="/fragments/featured-books"
          />
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
          <NewsletterCard />
        </ScrollReveal>
        <ScrollReveal>
          <PageBleed>
            <DiscoveryTags />
          </PageBleed>
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
  <div class="text-center text-2xl font-bold">
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
      class="border-b-2 border-black inline-block transition-opacity duration-300"
    />{" "}
    for photobook lovers.
  </div>
);
