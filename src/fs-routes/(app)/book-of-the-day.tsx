import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import { getRecentBooksOfTheDay } from "../../features/app/BOTDServices";
import SectionTitle from "../../components/app/SectionTitle";
import { toDateString } from "../../lib/utils";
import BookCard from "../../components/app/BookCard";
import InfoPage from "../../pages/InfoPage";
import ScrollReveal from "../../components/app/ScrollReveal";
import { getIsMobile } from "../../lib/device";
import GridPanel from "../../components/app/GridPanel";
import ListNavigation from "../../features/app/components/ListNavigation";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import { botdPath } from "../../features/app/spotlightUrls";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  const [error, result] = await getRecentBooksOfTheDay(currentPage);
  if (error)
    return c.html(
      <InfoPage errorMessage="Failed to get books of the day" user={user} />,
    );

  const { botdEntries, totalPages, page } = result;
  const targetId = "botd-list";

  const title = pageTitle("Book of the Day");
  const description =
    "Explore photobookers Books of the Day — curated photobook highlights from our community.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/book-of-the-day")}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <SectionTitle>Books of the Day</SectionTitle>
        <GridPanel id={targetId} isFullWidth xMerge="append">
          {botdEntries.map((entry) => (
            <ScrollReveal>
              <article class="space-y-2 ">
                <a
                  href={botdPath(entry.date)}
                  class="text-xs text-on-surface-strong font-medium hover:underline"
                >
                  {toDateString(entry.date)}
                </a>

                <BookCard book={entry.book} user={user} />
              </article>
            </ScrollReveal>
          ))}
        </GridPanel>
        <ListNavigation
          isInfiniteScroll
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </Page>
    </AppLayout>,
  );
});
