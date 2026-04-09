import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import SectionTitle from "../../components/app/SectionTitle";
import InfoPage from "../../pages/InfoPage";
import { InfiniteScroll } from "../../components/app/InfiniteScroll";
import { toWeekString } from "../../lib/utils";
import CreatorCard from "../../components/app/CreatorCard";
import { getRecentArtistsOfTheWeek } from "../../features/app/AOTWServices";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  const [error, result] = await getRecentArtistsOfTheWeek(currentPage);
  if (error) {
    return c.html(
      <InfoPage errorMessage="Failed to get artists of the week" user={user} />,
    );
  }

  const { aotwEntries, totalPages, page } = result;
  const targetId = "aotw-list";

  return c.html(
    <AppLayout title="Artist of the Week" user={user} currentPath={currentPath}>
      <Page>
        <div class="mx-auto max-w-xl space-y-6">
          <SectionTitle>Artists of the Week</SectionTitle>
          <div x-data>
            <div id={targetId} x-merge="append" class="flex flex-col gap-12">
              {aotwEntries.length === 0 ? (
                <p class="text-sm text-on-surface">
                  No artists of the week yet.
                </p>
              ) : (
                aotwEntries.map((entry) => (
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
