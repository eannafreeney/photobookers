import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import { getRecentBooksOfTheWeek } from "../../features/app/BOTWServices";
import SectionTitle from "../../components/app/SectionTitle";
import { toWeekString } from "../../lib/utils";
import BookCard from "../../components/app/BookCard";
import InfoPage from "../../pages/InfoPage";
import { InfiniteScroll } from "../../components/app/InfiniteScroll";
import ScrollReveal from "../../components/app/ScrollReveal";
import { getIsMobile } from "../../lib/device";
import GridPanel from "../../components/app/GridPanel";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

  const [error, result] = await getRecentBooksOfTheWeek(currentPage);
  if (error)
    return c.html(
      <InfoPage errorMessage="Failed to get books of the week" user={user} />,
    );

  const { botwEntries, totalPages, page } = result;
  const targetId = "botw-list";

  return c.html(
    <AppLayout title="Book of the Week" user={user} currentPath={currentPath}>
      <Page>
        <SectionTitle>Books of the Week</SectionTitle>
        <GridPanel
          id={targetId}
          isFullWidth
          xMerge={isMobile ? "append" : "replace"}
        >
          {botwEntries.map((entry) => (
            <ScrollReveal>
              <article class="space-y-2 ">
                <p class="text-xs text-on-surface-strong font-medium">
                  Week: {toWeekString(entry.weekStart)}
                </p>
                <BookCard book={entry.book} user={user} />
              </article>
            </ScrollReveal>
          ))}
        </GridPanel>
        <InfiniteScroll
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </Page>
    </AppLayout>,
  );
});
