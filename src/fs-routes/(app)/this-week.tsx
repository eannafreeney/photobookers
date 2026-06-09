import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import SectionTitle from "../../components/app/SectionTitle";
import BookCard from "../../components/app/BookCard";
import CreatorCard from "../../components/app/CreatorCard";
import NewsletterCard from "../../features/app/components/NewsletterCard";
import InterviewCard from "../../features/app/components/InterviewCard";
import { getBooksOfTheDayInRange } from "../../features/app/BOTDServices";
import {
  getArtistOfTheWeekForDateQuery,
  getPublisherOfTheWeekForDateQuery,
} from "../../features/dashboard/admin/planner/services";
import { getInterviewByCreatorSlug } from "../../features/app/services";
import { formatWeekRangeLabel } from "../../features/dashboard/admin/planner/newsletterUtils";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import {
  parseWeekString,
  toDateString,
  toWeekStart,
  toWeekString,
} from "../../lib/utils";
import { botdPath } from "../../features/app/spotlightUrls";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  const weekParam = c.req.query("week");
  const weekStart = weekParam
    ? parseWeekString(weekParam)
    : toWeekStart(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const [
    [botdErr, botdResult],
    [artistErr, artist],
    [publisherErr, publisher],
  ] = await Promise.all([
    getBooksOfTheDayInRange(weekStart, weekEnd),
    getArtistOfTheWeekForDateQuery(weekStart),
    getPublisherOfTheWeekForDateQuery(weekStart),
  ]);

  const label = formatWeekRangeLabel(weekStart, weekEnd);
  const title = pageTitle(`This week on Photobookers`);
  const path = `/this-week?week=${toWeekString(weekStart)}`;

  // Optional: fetch interviews for featured creators
  const artistInterview =
    !artistErr && artist?.creator
      ? await getInterviewByCreatorSlug(artist.creator.slug)
      : null;

  return c.html(
    <AppLayout
      title={title}
      description={`Books of the Day, Artist and Publisher of the Week for ${label}.`}
      canonicalUrl={canonicalUrl(c.req.url, path)}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <h1 class="text-3xl font-bold">This week on Photobookers</h1>
        <p class="text-on-surface mt-2">{label}</p>

        {!botdErr && botdResult.botdEntries.length > 0 ? (
          <section class="mt-10">
            <SectionTitle>Books of the Day</SectionTitle>
            <div class="grid gap-8">
              {botdResult.botdEntries.map((entry) => (
                <article>
                  <a
                    href={botdPath(entry.date)}
                    class="text-sm font-medium hover:underline"
                  >
                    {toDateString(entry.date)}
                  </a>
                  <BookCard book={entry.book} user={user} />
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!artistErr && artist?.creator ? (
          <section class="mt-10">
            <SectionTitle>Artist of the Week</SectionTitle>
            <CreatorCard
              creator={artist.creator}
              user={user}
              currentPath={currentPath}
            />
          </section>
        ) : null}

        {!publisherErr && publisher?.creator ? (
          <section class="mt-10">
            <SectionTitle>Publisher of the Week</SectionTitle>
            <CreatorCard
              creator={publisher.creator}
              user={user}
              currentPath={currentPath}
            />
          </section>
        ) : null}

        {artistInterview?.[1] ? (
          <section class="mt-10">
            <SectionTitle>Interview</SectionTitle>
            <InterviewCard
              interview={artistInterview[1]}
              link={`/interviews/view/${artistInterview[1].creator.slug}`}
            />
          </section>
        ) : null}

        <div class="mt-12">
          <NewsletterCard />
        </div>
      </Page>
    </AppLayout>,
  );
});
