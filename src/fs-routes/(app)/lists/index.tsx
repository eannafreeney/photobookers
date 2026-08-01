import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { getUser } from "../../../utils";
import InfoPage from "../../../pages/InfoPage";
import { getPromotedLists } from "../../../domain/lists/services";
import PromotedListCard from "../../../features/app/components/PromotedListCard";
import PageHeader from "../../../components/app/PageHeader";
import { canonicalUrl, pageTitle } from "../../../lib/seo";
import { isFeatureEnabledForUser } from "../../../lib/features";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  if (!isFeatureEnabledForUser("collectors", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [error, lists] = await getPromotedLists(24);
  if (error) {
    return c.html(<InfoPage errorMessage={error.reason} user={user} />);
  }
  if (!lists?.length) {
    return c.html(
      <InfoPage errorMessage="No promoted lists yet" user={user} />,
    );
  }

  const title = pageTitle("Lists");
  const description =
    "Curated photobook lists from collectors and creators on Photobookers.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/lists")}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <div class="flex flex-col gap-6">
          <PageHeader
            kicker="From collectors"
            title="Lists"
            intro="Playlist-style photobook lists curated by the community."
          />
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <PromotedListCard list={list} widthClass="w-full" />
            ))}
          </div>
        </div>
      </Page>
    </AppLayout>,
  );
});
