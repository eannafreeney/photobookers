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
import { getIsMobile } from "../../lib/device";
import GridPanel from "../../components/app/GridPanel";
import ListNavigation from "../../features/app/components/ListNavigation";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

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
        <SectionTitle>Publishers of the Week</SectionTitle>
        <GridPanel
          id={targetId}
          isFullWidth
          xMerge={isMobile ? "append" : "replace"}
        >
          {potwEntries.map((entry) => (
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
