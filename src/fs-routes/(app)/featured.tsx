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

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Books" user={user} currentPath={currentPath}>
      <NewsletterBanner />
      <Page>
        <HeroCarousel />
        <div class="text-center text-2xl font-bold">
          The social network for photobook lovers.
        </div>
        <Intersector id="stats-fragment" endpoint="/fragments/stats" />
        <SiteFeatures />
        <Intersector
          id="featured-books-fragment"
          endpoint="/fragments/featured-books"
        />
        <Intersector
          id="creators-slider-fragment"
          endpoint="/fragments/creators-slider"
        />
        <NewsletterCard />
        <DiscoveryTags />
        <Intersector
          id="latest-books-fragment"
          endpoint="/fragments/latest-books"
        />
      </Page>
    </AppLayout>,
  );
});
