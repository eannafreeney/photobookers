import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import ThisWeekDetail from "../../features/app/components/ThisWeekDetail";
import { getBooksOfTheDayInRange } from "../../features/app/BOTDServices";
import { getArtistOfTheWeekForDateQuery } from "../../features/app/AOTWServices";
import { getPublisherOfTheWeekForDateQuery } from "../../features/app/POTWServices";
import { getInterviewByCreatorSlug } from "../../features/app/services";
import { formatWeekRangeLabel } from "../../features/dashboard/admin/planner/newsletterUtils";
import {
  canonicalUrl,
  pageTitle,
  truncateDescription,
} from "../../lib/seo";
import {
  capEndOfDayToToday,
  parseWeekString,
  toWeekStart,
} from "../../lib/utils";
import { thisWeekPath } from "../../features/app/spotlightUrls";
import type { InterviewPreview } from "../../features/app/components/InterviewPreviewSection";

async function fetchPublishedInterview(
  slug: string | undefined,
): Promise<InterviewPreview | null> {
  if (!slug) return null;
  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error || !interview || interview.status !== "published") return null;
  return interview;
}

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
    [artistErr, artistOfTheWeek],
    [publisherErr, publisherOfTheWeek],
  ] = await Promise.all([
    getBooksOfTheDayInRange(weekStart, capEndOfDayToToday(weekEnd)),
    getArtistOfTheWeekForDateQuery(weekStart),
    getPublisherOfTheWeekForDateQuery(weekStart),
  ]);

  const weekRangeLabel = formatWeekRangeLabel(weekStart, weekEnd);
  const path = thisWeekPath(weekStart);
  const title = pageTitle("This week on Photobookers");
  const description = truncateDescription(
    `Books of the Day, Artist and Publisher of the Week for ${weekRangeLabel}.`,
  );

  const botdEntries = !botdErr ? botdResult.botdEntries : [];

  const [artistInterview, publisherInterview] = await Promise.all([
    fetchPublishedInterview(artistOfTheWeek?.creator.slug),
    fetchPublishedInterview(publisherOfTheWeek?.creator.slug),
  ]);

  const shareImage =
    botdEntries[0]?.book.coverUrl ??
    artistOfTheWeek?.instagramImageUrl ??
    publisherOfTheWeek?.instagramImageUrl ??
    artistOfTheWeek?.creator.coverUrl ??
    publisherOfTheWeek?.creator.coverUrl ??
    undefined;

  if (!user) {
    c.header("Vary", "Cookie");
    c.header(
      "Cache-Control",
      "private, max-age=120, stale-while-revalidate=600",
    );
  } else {
    c.header("Cache-Control", "private, no-store");
  }

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, path)}
      user={user}
      currentPath={currentPath}
      shareOg={{
        title,
        description,
        image: shareImage,
        url: canonicalUrl(c.req.url, path),
      }}
    >
      <Page>
        <ThisWeekDetail
          user={user}
          weekStart={weekStart}
          weekRangeLabel={weekRangeLabel}
          botdEntries={botdEntries}
          artistOfTheWeek={!artistErr && artistOfTheWeek ? artistOfTheWeek : null}
          publisherOfTheWeek={
            !publisherErr && publisherOfTheWeek ? publisherOfTheWeek : null
          }
          artistInterview={artistInterview}
          publisherInterview={publisherInterview}
        />
      </Page>
    </AppLayout>,
  );
});
