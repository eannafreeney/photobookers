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
import ScrollReveal from "../../components/app/ScrollReveal";
import GridPanel from "../../components/app/GridPanel";
import { getIsMobile } from "../../lib/device";
import ListNavigation from "../../features/app/components/ListNavigation";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

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
        <SectionTitle>Artists of the Week</SectionTitle>
        <GridPanel
          id={targetId}
          isFullWidth
          xMerge={isMobile ? "append" : "replace"}
        >
          {aotwEntries.map((entry) => (
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
          ))}
        </GridPanel>
        <ListNavigation
          isInfiniteScroll={isMobile}
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </Page>
    </AppLayout>,
  );
});
