import { createRoute } from "hono-fsr";
import { getUser, getFlash } from "../../utils";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import Intersector from "../../features/app/components/Intersector";
import NewsletterCard from "../../features/app/components/NewsletterCard";
import ScrollReveal from "../../components/app/ScrollReveal";
import FeaturedBookGroups from "../../features/app/components/FeaturedBookGroups";
import {
  buildHomeJsonLd,
  canonicalUrl,
  HOMEPAGE_DESCRIPTION,
  pageTitle,
} from "../../lib/seo";
import { loadBookOfTheDayFeature, loadCreatorsOfTheWeek } from "../../features/app/utils";
import { heroLcpImageSources } from "../../lib/imageUrl";
import PageBleed from "../../components/layouts/PageBleedRight";
import BookOfTheDayAnchor from "../../features/app/components/BookOfTheDayAnchor";
import CreatorOfTheWeekSpotlight from "../../features/app/components/CreatorOfTheWeekSpotlight";
import SectionSkeleton from "../../features/app/components/SectionSkeleton";
import HomepageAudiencePitch from "../../features/app/components/HomepageAudiencePitch";
import DiscoveryTagChips from "../../features/app/components/DiscoveryTagChips";
import { AuthUser } from "../../../types";

export const GET = createRoute(async (c: Context) => {
  const [user, bookOfTheDay, flash] = await Promise.all([
    getUser(c),
    loadBookOfTheDayFeature(),
    getFlash(c),
  ]);
  const currentPath = c.req.path;
  const lcpSource =
    bookOfTheDay.today?.featuredImageUrl ??
    bookOfTheDay.today?.book.coverUrl ??
    null;
  const lcpImage = lcpSource ? heroLcpImageSources(lcpSource) : undefined;
  const homeCanonical = canonicalUrl(c.req.url, "/");

  const title = pageTitle("Discover Photobooks from Artists & Publishers");
  const description = HOMEPAGE_DESCRIPTION;

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={homeCanonical}
      user={user}
      currentPath={currentPath}
      preloadLcpImage={lcpImage}
      flash={flash}
      shareOg={{
        title,
        description,
        image: lcpSource ?? undefined,
        url: homeCanonical,
      }}
      jsonLd={buildHomeJsonLd(homeCanonical, lcpSource)}
    >
      <DiscoveryTagChips />
      <Page>
        {bookOfTheDay.today ? (
          <BookOfTheDayAnchor
            today={bookOfTheDay.today}
            yesterday={bookOfTheDay.yesterday}
            twoDaysAgo={bookOfTheDay.twoDaysAgo}
            threeDaysAgo={bookOfTheDay.threeDaysAgo}
            user={user}
          />
        ) : null}

        {!user ? <HomepageAudiencePitch /> : null}

        <ScrollReveal>
          <Intersector
            id="recent-activity-fragment"
            endpoint="/fragments/recent-activity"
          >
            <SectionSkeleton variant="cards" withHeader={false} />
          </Intersector>
        </ScrollReveal>

        {!user ? (
          <ScrollReveal>
            <Intersector id="stats-fragment" endpoint="/fragments/stats">
              <SectionSkeleton variant="stats" withHeader={false} />
            </Intersector>
          </ScrollReveal>
        ) : null}

        <ScrollReveal>
          <NewsletterCard />
        </ScrollReveal>

        <ScrollReveal>
          <PageBleed>
            <FeaturedBookGroups />
          </PageBleed>
        </ScrollReveal>

        <ScrollReveal>
          <CreatorsOfTheWeek user={user} />
        </ScrollReveal>

        <ScrollReveal>
          <Intersector
            id="creators-slider-fragment"
            endpoint="/fragments/creators-slider"
          >
            <SectionSkeleton variant="circles" />
          </Intersector>
        </ScrollReveal>
        <ScrollReveal>
          <Intersector
            id="interviews-fragment"
            endpoint="/fragments/interviews"
          >
            <SectionSkeleton variant="spread" />
          </Intersector>
        </ScrollReveal>
        <ScrollReveal>
          <PageBleed>
            <Intersector id="lists-fragment" endpoint="/fragments/lists">
              <SectionSkeleton variant="cards" />
            </Intersector>
          </PageBleed>
        </ScrollReveal>
        <ScrollReveal>
          <Intersector
            id="latest-books-fragment"
            endpoint="/fragments/latest-books"
          >
            <SectionSkeleton variant="grid" />
          </Intersector>
        </ScrollReveal>
        <ScrollReveal>
          <Intersector id="fairs-fragment" endpoint="/fragments/fairs">
            <SectionSkeleton variant="rows" />
          </Intersector>
        </ScrollReveal>
        <ScrollReveal>
          <Intersector id="stores-fragment" endpoint="/fragments/stores">
            <SectionSkeleton variant="columns" />
          </Intersector>
        </ScrollReveal>
      </Page>
    </AppLayout>,
  );
});

/** Both weekly picks, side by side — no rotation, nothing hidden. */
const CreatorsOfTheWeek = async ({ user }: { user: AuthUser | null }) => {
  const { artist, publisher } = await loadCreatorsOfTheWeek();
  if (!artist && !publisher) return <></>;

  return (
    <div class="grid items-start gap-8 py-4 md:grid-cols-2 md:gap-10">
      {artist ? (
        <CreatorOfTheWeekSpotlight spotlight={artist} user={user} />
      ) : null}
      {publisher ? (
        <CreatorOfTheWeekSpotlight spotlight={publisher} user={user} />
      ) : null}
    </div>
  );
};
