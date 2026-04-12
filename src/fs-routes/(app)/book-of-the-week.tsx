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

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

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
        <div class="mx-auto max-w-5xl space-y-6">
          <SectionTitle>Books of the Week</SectionTitle>
          <div x-data>
            <div id={targetId} x-merge="append" class="flex flex-col gap-12">
              {botwEntries.length === 0 ? (
                <p class="text-sm text-on-surface">No books of the week yet.</p>
              ) : (
                botwEntries.map((entry) => (
                  <ScrollReveal>
                    <article class="space-y-2 ">
                      <p class="text-xs text-on-surface-strong font-medium">
                        Week: {toWeekString(entry.weekStart)}
                      </p>
                      <BookCard
                        book={entry.book}
                        user={user}
                        maxDisplayNameLength={30}
                      />
                    </article>
                  </ScrollReveal>
                ))
              )}
            </div>
            <InfiniteScroll
              baseUrl={currentPath}
              page={page}
              totalPages={totalPages}
              targetId={targetId}
            />
          </div>
        </div>
      </Page>
    </AppLayout>,
  );
});
