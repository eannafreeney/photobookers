import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import SectionTitle from "../../components/app/SectionTitle";
import InfoPage from "../../pages/InfoPage";
import { InfiniteScroll } from "../../components/app/InfiniteScroll";
import { toWeekString } from "../../lib/utils";
import CreatorCard from "../../components/app/CreatorCard";
import { getRecentPublishersOfTheWeek } from "../../features/app/POTWServices";
import ScrollReveal from "../../components/app/ScrollReveal";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  const [error, result] = await getRecentPublishersOfTheWeek(currentPage);
  if (error) {
    return c.html(
      <InfoPage
        errorMessage="Failed to get publishers of the week"
        user={user}
      />,
    );
  }

  const { potwEntries, totalPages, page } = result;
  const targetId = "potw-list";

  return c.html(
    <AppLayout
      title="Publisher of the Week"
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <div class="mx-auto max-w-xl space-y-6">
          <SectionTitle>Publishers of the Week</SectionTitle>
          <div x-data>
            <div id={targetId} x-merge="append" class="flex flex-col gap-12">
              {potwEntries.length === 0 ? (
                <p class="text-sm text-on-surface">
                  No publishers of the week yet.
                </p>
              ) : (
                potwEntries.map((entry) => (
                  <ScrollReveal>
                    <article class="space-y-2">
                      <p class="text-xs text-on-surface-strong font-medium">
                        Week: {toWeekString(entry.weekStart)}
                      </p>
                      <CreatorCard
                        creator={entry.creator}
                        user={user}
                        currentPath={currentPath}
                        showFollowAndClaimButtons={false}
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
