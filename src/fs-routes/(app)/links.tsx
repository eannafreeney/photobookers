import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import LinksPage from "../../features/app/components/LinksPage";
import { getRecentlyVerifiedCreators } from "../../features/app/services";
import { getTodaysBookOfTheDay } from "../../features/app/BOTDServices";
import { getThisWeeksArtistOfTheWeek } from "../../features/app/AOTWServices";
import { getThisWeeksPublisherOfTheWeek } from "../../features/app/POTWServices";
import { canonicalUrl, pageTitle, truncateDescription } from "../../lib/seo";
import HeadlessLayout from "../../components/layouts/HeadlessLayout";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  const [
    [botdErr, bookOfTheDay],
    [artistErr, artistOfTheWeek],
    [publisherErr, publisherOfTheWeek],
    [newCreatorsErr, newlyVerifiedCreators],
  ] = await Promise.all([
    getTodaysBookOfTheDay(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
    getRecentlyVerifiedCreators(),
  ]);

  const title = pageTitle("Photobookers");
  const description = truncateDescription(
    "Today's Book of the Day, plus this week's Artist and Publisher of the Week.",
  );

  const botd = !botdErr ? bookOfTheDay : null;
  const artist = !artistErr ? artistOfTheWeek : null;
  const publisher = !publisherErr ? publisherOfTheWeek : null;
  const newCreators = !newCreatorsErr ? newlyVerifiedCreators : [];

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
    <HeadlessLayout
      title={title}
      description={description}
      showNavbar={false}
      showFooter={false}
    >
      <Page>
        <LinksPage
          bookOfTheDay={botd}
          artistOfTheWeek={artist}
          publisherOfTheWeek={publisher}
          newlyVerifiedCreators={newCreators}
        />
      </Page>
      ,
    </HeadlessLayout>,
  );
});
