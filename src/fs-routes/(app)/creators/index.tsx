import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils";
import Page from "../../../components/layouts/Page";
import AppLayout from "../../../components/layouts/AppLayout";
import InfoPage from "../../../pages/InfoPage";
import {
  getAllCreatorsByType,
  getAllCreatorsForBrowse,
  getFollowedCreatorsForBrowse,
} from "../../../features/app/services";
import PageHeader from "../../../components/app/PageHeader";
import CreatorsCircle from "../../../features/app/components/CreatorsCircle";
import CreatorsBrowseFilters from "../../../features/app/components/CreatorsBrowseFilters";
import ScrollReveal from "../../../components/app/ScrollReveal";
import ListNavigation from "../../../features/app/components/ListNavigation";
import {
  creatorsBrowseUrl,
  CREATOR_CATALOG_TARGET_ID,
  parseCreatorBrowseFilter,
  type CreatorBrowseFilter,
} from "../../../features/app/creatorsBrowse";
import { paginationRequestBaseUrl } from "../../../lib/pagination";
import { ok } from "../../../lib/result";
import { canonicalUrl, pageTitle } from "../../../lib/seo";
import { AuthUser } from "../../../../types";
import { CreatorCardResult } from "../../../constants/queries";

const PAGE_SIZE = 48;
const targetId = "creators-grid";

async function loadCreatorsForFilter(
  filter: CreatorBrowseFilter,
  page: number,
  user: AuthUser | null,
) {
  switch (filter) {
    case "artist":
      return getAllCreatorsByType("artist", page, PAGE_SIZE);
    case "publisher":
      return getAllCreatorsByType("publisher", page, PAGE_SIZE);
    case "following":
      if (!user) {
        return ok({ creators: [], totalPages: 1, page: 1 });
      }
      return getFollowedCreatorsForBrowse(user.id, page, PAGE_SIZE);
    default:
      return getAllCreatorsForBrowse(page, PAGE_SIZE);
  }
}

type CatalogProps = {
  filter: CreatorBrowseFilter;
  creators: CreatorCardResult[];
  page: number;
  totalPages: number;
  paginationBaseUrl: string;
  user: AuthUser | null;
};

const CreatorsBrowseCatalog = ({
  filter,
  creators,
  page,
  totalPages,
  paginationBaseUrl,
  user,
}: CatalogProps) => (
  <div id={CREATOR_CATALOG_TARGET_ID} x-merge="replace">
    <CreatorsBrowseFilters activeFilter={filter} user={user} />
    <div
      id={targetId}
      x-merge="append"
      class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6"
    >
      {creators.map((creator) => (
        <ScrollReveal>
          <CreatorsCircle
            creator={creator}
            showType={filter === "all" || filter === "following"}
          />
        </ScrollReveal>
      ))}
    </div>
    <ListNavigation
      isInfiniteScroll
      currentPath={paginationBaseUrl}
      page={page}
      totalPages={totalPages}
      targetId={targetId}
    />
  </div>
);

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPage = Number(c.req.query("page") ?? 1);
  const filter = parseCreatorBrowseFilter(c.req.query("type"), Boolean(user));
  const paginationBaseUrl = paginationRequestBaseUrl(c.req.url);
  const canonicalPath = creatorsBrowseUrl(filter);

  const [error, result] = await loadCreatorsForFilter(
    filter,
    currentPage,
    user,
  );

  if (error) {
    return c.html(<InfoPage errorMessage="Creators not found" user={user} />);
  }

  const { creators, totalPages, page } = result;

  const catalog = (
    <CreatorsBrowseCatalog
      filter={filter}
      creators={creators}
      page={page}
      totalPages={totalPages}
      paginationBaseUrl={paginationBaseUrl}
      user={user}
    />
  );

  if (c.req.query("fragment") === "catalog") {
    return c.html(catalog);
  }

  const title = pageTitle("Creators");
  const description =
    "Discover photobook artists and publishers on photobookers. Browse profiles and explore their published work.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, canonicalPath)}
      user={user}
      currentPath={canonicalPath}
    >
      <Page>
        <PageHeader
          kicker="The People"
          title="Creators"
          intro="Artists and publishers behind the books — browse profiles and explore their published work."
        />
        <div x-data x-ref="paginationContent">
          {catalog}
        </div>
      </Page>
    </AppLayout>,
  );
});
