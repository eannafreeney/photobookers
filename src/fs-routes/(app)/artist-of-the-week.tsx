import { createRoute } from "hono-fsr";
import { formatDate, getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import { InfiniteScroll } from "../../components/app/InfiniteScroll";
import { formatCountry } from "../../lib/utils";
import SpotlightCard from "../../components/app/SpotlightCard";
import { getRecentArtistsOfTheWeek } from "../../features/app/AOTWServices";
import ScrollReveal from "../../components/app/ScrollReveal";
import GridPanel from "../../components/app/GridPanel";
import { getIsMobile } from "../../lib/device";
import ListNavigation from "../../features/app/components/ListNavigation";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import { aotwPath } from "../../features/app/spotlightUrls";

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

  const title = pageTitle("Artist of the Week");
  const description =
    "Meet photobookers Artists of the Week — featured artists from the photobook community.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/artist-of-the-week")}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader kicker="The Archive" title="Artists of the Week" intro="Every week, one artist in focus. Browse past spotlights." />
        <GridPanel id={targetId} isFullWidth xMerge="append">
          {aotwEntries.map((entry) => (
            <ScrollReveal>
              <SpotlightCard
                href={aotwPath(entry.weekStart)}
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
