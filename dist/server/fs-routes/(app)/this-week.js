import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import ThisWeekDetail from "../../features/app/components/ThisWeekDetail.js";
import { getBooksOfTheDayInRange } from "../../features/app/BOTDServices.js";
import { getArtistOfTheWeekForDateQuery } from "../../features/app/AOTWServices.js";
import { getPublisherOfTheWeekForDateQuery } from "../../features/app/POTWServices.js";
import { getInterviewByCreatorSlug } from "../../features/app/services.js";
import { formatWeekRangeLabel } from "../../domain/planner/newsletterUtils.js";
import { canonicalUrl, pageTitle, truncateDescription } from "../../lib/seo.js";
import {
  capEndOfDayToToday,
  parseWeekString,
  toWeekStart
} from "../../lib/utils.js";
import { thisWeekPath } from "../../features/app/spotlightUrls.js";
async function fetchPublishedInterview(slug) {
  if (!slug) return null;
  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error || !interview || interview.status !== "published") return null;
  return interview;
}
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const weekParam = c.req.query("week");
  const weekStart = weekParam ? parseWeekString(weekParam) : toWeekStart(/* @__PURE__ */ new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const [
    [botdErr, botdResult],
    [artistErr, artistOfTheWeek],
    [publisherErr, publisherOfTheWeek]
  ] = await Promise.all([
    getBooksOfTheDayInRange(weekStart, capEndOfDayToToday(weekEnd)),
    getArtistOfTheWeekForDateQuery(weekStart),
    getPublisherOfTheWeekForDateQuery(weekStart)
  ]);
  const weekRangeLabel = formatWeekRangeLabel(weekStart, weekEnd);
  const path = thisWeekPath(weekStart);
  const title = pageTitle("This week on Photobookers");
  const description = truncateDescription(
    `Books of the Day, Artist and Publisher of the Week for ${weekRangeLabel}.`
  );
  const botdEntries = !botdErr ? botdResult.botdEntries : [];
  const shareImage = botdEntries[0]?.book.coverUrl ?? artistOfTheWeek?.instagramImageUrl ?? publisherOfTheWeek?.instagramImageUrl ?? artistOfTheWeek?.creator.coverUrl ?? publisherOfTheWeek?.creator.coverUrl ?? void 0;
  if (!user) {
    c.header("Vary", "Cookie");
    c.header(
      "Cache-Control",
      "private, max-age=120, stale-while-revalidate=600"
    );
  } else {
    c.header("Cache-Control", "private, no-store");
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, path),
        user,
        currentPath,
        shareOg: {
          title,
          description,
          image: shareImage,
          url: canonicalUrl(c.req.url, path)
        },
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(
          ThisWeekDetail,
          {
            weekStart,
            weekRangeLabel,
            botdEntries,
            artistOfTheWeek: !artistErr && artistOfTheWeek ? artistOfTheWeek : null,
            publisherOfTheWeek: !publisherErr && publisherOfTheWeek ? publisherOfTheWeek : null
          }
        ) })
      }
    )
  );
});
export {
  GET
};
