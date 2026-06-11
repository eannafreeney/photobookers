import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import AppLayout from "../../components/layouts/AppLayout";
import InfoPage from "../../pages/InfoPage";
import { getAllCreatorsByType } from "../../features/app/services";
import PageHeader from "../../components/app/PageHeader";
import CreatorsCircle from "../../features/app/components/CreatorsCircle";
import ScrollReveal from "../../components/app/ScrollReveal";
import { InfiniteScroll } from "../../components/app/InfiniteScroll";
import { canonicalUrl, pageTitle } from "../../lib/seo";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

  const [error, result] = await getAllCreatorsByType("artist", currentPage, 50);

  if (error) return c.html(<InfoPage errorMessage="Artists not found" />);

  const title = pageTitle("Artists");
  const description =
    "Discover photobook artists on photobookers. Browse profiles and explore their published work.";
  const { creators, totalPages, page } = result;

  const targetId = "artists-grid";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/artists")}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="The People"
          title="Artists"
          intro="The photographers and artists behind the books — browse their profiles and explore their published work."
        />
        <div x-data>
          <div
            id={targetId}
            x-merge="append"
            class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6"
          >
            {creators.map((creator) => (
              <ScrollReveal>
                <CreatorsCircle creator={creator} />
              </ScrollReveal>
            ))}
          </div>
          <InfiniteScroll
            baseUrl={currentPath}
            page={page}
            totalPages={totalPages}
            targetId={targetId}
          />
        </div>
      </Page>
    </AppLayout>,
  );
});
