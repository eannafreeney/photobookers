import { createRoute } from "hono-fsr";
import { getUser, getFlash } from "../../utils";
import { Context } from "hono";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import SiteFeatures from "../../features/app/components/SiteFeatures";
import Intersector from "../../features/app/components/Intersector";
import NewsletterCard from "../../features/app/components/NewsletterCard";
import ScrollReveal from "../../components/app/ScrollReveal";
import FeaturedBookGroups from "../../features/app/components/FeaturedBookGroups";
import { canonicalUrl, DEFAULT_DESCRIPTION, pageTitle } from "../../lib/seo";
import {
  loadBookOfTheDayFeature,
  loadCreatorsOfTheWeek,
} from "../../features/app/utils";
import { heroLcpImageSources } from "../../lib/imageUrl";
import PageBleed from "../../components/layouts/PageBleedRight";
import { getHomepageActivityStats } from "@/features/app/homepageActivity";
import BookOfTheDayAnchor from "../../features/app/components/BookOfTheDayAnchor";
import CreatorOfTheWeekSpotlight from "../../features/app/components/CreatorOfTheWeekSpotlight";
import DiscoveryTagChips from "../../features/app/components/DiscoveryTagChips";
import SectionSkeleton from "../../features/app/components/SectionSkeleton";
import { getRecentPublicActivityPage } from "../../features/app/homepageRecentActivity";
import HomepageRecentActivity from "@/features/app/components/HomepageRecentActivity";
import { AuthUser } from "../../../types";

export const GET = createRoute(async (c: Context) => {
  const [user, bookOfTheDay, flash] = await Promise.all([
    getUser(c),
    loadBookOfTheDayFeature(),
    getFlash(c),
  ]);
  const currentPath = c.req.path;
  // The Book of the Day block now opens the page, so it owns the LCP image.
  const lcpSource =
    bookOfTheDay.today?.featuredImageUrl ??
    bookOfTheDay.today?.book.coverUrl ??
    null;
  const lcpImage = lcpSource ? heroLcpImageSources(lcpSource) : undefined;

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
      flash={flash}
    >
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
        <Slogan />
        <DiscoveryTagChips />
        <ScrollReveal>
          <RecentActivity user={user} />
        </ScrollReveal>

        {!user && (
          <>
            <ScrollReveal>
              <Intersector id="stats-fragment" endpoint="/fragments/stats">
                <SectionSkeleton variant="stats" withHeader={false} />
              </Intersector>
            </ScrollReveal>
            <ScrollReveal>
              <SiteFeatures />
            </ScrollReveal>
          </>
        )}

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

const Slogan = () => (
  <div class="flex flex-col items-center gap-4 border-t-2 border-on-surface-strong py-8 pt-6 text-center">
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

/** Live event strip; the weekly view counts ride along in its header. */
const RecentActivity = async ({ user }: { user: AuthUser | null }) => {
  const [[error, page], [statsError, stats]] = await Promise.all([
    getRecentPublicActivityPage(),
    getHomepageActivityStats(),
  ]);

  if (error || !page?.items.length) return <></>;

  return (
    <HomepageRecentActivity
      items={page.items}
      currentUserId={user?.id}
      hasMore={page.hasMore}
      nextOffset={page.nextOffset}
      pageSize={page.pageSize}
      stats={statsError ? null : stats}
    />
  );
};
