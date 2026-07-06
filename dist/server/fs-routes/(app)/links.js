import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../utils.js";
import Page from "../../components/layouts/Page.js";
import LinksPage from "../../features/app/components/LinksPage.js";
import { getRecentlyVerifiedCreators } from "../../features/app/services.js";
import { getTodaysBookOfTheDay } from "../../features/app/BOTDServices.js";
import { getThisWeeksArtistOfTheWeek } from "../../features/app/AOTWServices.js";
import { getThisWeeksPublisherOfTheWeek } from "../../features/app/POTWServices.js";
import { pageTitle, truncateDescription } from "../../lib/seo.js";
import HeadlessLayout from "../../components/layouts/HeadlessLayout.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const [
    [botdErr, bookOfTheDay],
    [artistErr, artistOfTheWeek],
    [publisherErr, publisherOfTheWeek],
    [newCreatorsErr, newlyVerifiedCreators]
  ] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
    getRecentlyVerifiedCreators()
  ]);
  const title = pageTitle("Photobookers");
  const description = truncateDescription(
    "Today's Book of the Day, plus this week's Artist and Publisher of the Week."
  );
  const botd = !botdErr ? bookOfTheDay : null;
  const artist = !artistErr ? artistOfTheWeek : null;
  const publisher = !publisherErr ? publisherOfTheWeek : null;
  const newCreators = !newCreatorsErr ? newlyVerifiedCreators : [];
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
    /* @__PURE__ */ jsxs(
      HeadlessLayout,
      {
        title,
        description,
        showNavbar: false,
        showFooter: false,
        children: [
          /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(
            LinksPage,
            {
              bookOfTheDay: botd,
              artistOfTheWeek: artist,
              publisherOfTheWeek: publisher,
              newlyVerifiedCreators: newCreators
            }
          ) }),
          ","
        ]
      }
    )
  );
});
export {
  GET
};
