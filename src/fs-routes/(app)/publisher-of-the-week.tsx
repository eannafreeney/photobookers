import { createRoute } from "hono-fsr";
import { formatDate, getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import { InfiniteScroll } from "../../components/app/InfiniteScroll";
import { formatCountry } from "../../lib/utils";
import SpotlightCard from "../../components/app/SpotlightCard";
import { getRecentPublishersOfTheWeek } from "../../features/app/POTWServices";
import ScrollReveal from "../../components/app/ScrollReveal";
import { getIsMobile } from "../../lib/device";
import GridPanel from "../../components/app/GridPanel";
import ListNavigation from "../../features/app/components/ListNavigation";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import { potwPath } from "../../features/app/spotlightUrls";

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

  const title = pageTitle("Publisher of the Week");
  const description =
    "Meet photobookers Publishers of the Week — featured publishers from the photobook community.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/publisher-of-the-week")}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader kicker="The Archive" title="Publishers of the Week" intro="Every week, one publisher in focus. Browse past spotlights." />
        <GridPanel id={targetId} isFullWidth xMerge="append">
          {potwEntries.map((entry) => (
            <ScrollReveal>
              <SpotlightCard
                href={potwPath(entry.weekStart)}
                imageUrl={entry.creator.coverUrl ?? ""}
                imageAlt={entry.creator.displayName}
                dateLabel={`Week of ${formatDate(entry.weekStart)}`}
                title={entry.creator.displayName}
                subtitle={
                  [
                    entry.creator.city,
                    formatCountry(entry.creator.country ?? ""),
                  ]
                    .filter(Boolean)
                    .join(", ") || undefined
                }
                aspectSquare
              />
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
