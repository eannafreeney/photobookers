import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import ThisWeekDetail from "../../features/app/components/ThisWeekDetail";
import { getBooksOfTheDayInRange } from "../../features/app/BOTDServices";
import { getArtistOfTheWeekForDateQuery } from "../../features/app/AOTWServices";
import { getPublisherOfTheWeekForDateQuery } from "../../features/app/POTWServices";
import { formatWeekRangeLabel } from "../../domain/newsletters/newsletterUtils";
import { canonicalUrl, pageTitle, truncateDescription } from "../../lib/seo";
import {
  capEndOfDayToToday,
  parseWeekString,
  toWeekStart,
} from "../../lib/utils";
import { thisWeekPath } from "../../features/app/spotlightUrls";
import { setAnonPageCache } from "../../lib/staticCache";
import { getTrendingForRange } from "../../domain/planner/trending";
import { getNewlyVerifiedCreatorsInRange } from "../../domain/newsletters/newMembers";

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
    trending,
    newMembers,
  ] = await Promise.all([
    getBooksOfTheDayInRange(weekStart, capEndOfDayToToday(weekEnd)),
    getArtistOfTheWeekForDateQuery(weekStart),
    getPublisherOfTheWeekForDateQuery(weekStart),
    getTrendingForRange(weekStart, capEndOfDayToToday(weekEnd)),
    getNewlyVerifiedCreatorsInRange(
      weekStart,
      capEndOfDayToToday(weekEnd),
    ),
  ]);

  const weekRangeLabel = formatWeekRangeLabel(weekStart, weekEnd);
  const path = thisWeekPath(weekStart);
  const title = pageTitle("This week on Photobookers");
  const description = truncateDescription(
    `Books of the Day, trending books and creators, and new members for ${weekRangeLabel}.`,
  );

  const botdEntries = !botdErr ? botdResult.botdEntries : [];

  const shareImage =
    botdEntries[0]?.book.coverUrl ??
    artistOfTheWeek?.featuredImageUrl ??
    publisherOfTheWeek?.featuredImageUrl ??
    artistOfTheWeek?.creator.coverUrl ??
    publisherOfTheWeek?.creator.coverUrl ??
    undefined;

  setAnonPageCache(c, user);

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
          weekStart={weekStart}
          weekRangeLabel={weekRangeLabel}
          botdEntries={botdEntries}
          artistOfTheWeek={
            !artistErr && artistOfTheWeek ? artistOfTheWeek : null
          }
          publisherOfTheWeek={
            !publisherErr && publisherOfTheWeek ? publisherOfTheWeek : null
          }
          trending={trending}
          newMembers={newMembers}
        />
      </Page>
    </AppLayout>,
  );
});
