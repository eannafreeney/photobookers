import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { slugSchema } from "../../../features/app/schema";
import { getIsMobile } from "../../../lib/device";
import { Context } from "hono";
import { getUser } from "../../../utils";
import { getBooksByCreatorSlug } from "../../../features/app/services";
import InfoPage from "../../../pages/InfoPage";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { BookCardResult, CreatorCardResult } from "../../../constants/queries";
import { AuthUser } from "../../../../types";
import { Creator } from "../../../db/schema";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import CreatorNavTabs from "../../../features/app/components/CreatorNavTabs";
import BooksGrid from "../../../features/app/components/BooksGrid";
import Divider from "../../../components/Divider";
import CreatorsGrid from "../../../features/app/components/RelatedCreators";
import CreatorCard from "../../../components/app/CreatorCard";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = c.req.param("slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");

    const [error, result] = await getBooksByCreatorSlug(slug, currentPage);

    if (error) {
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);
    }

    const { creator, relatedCreators } = result;

    return c.html(
      <AppLayout
        title={creator?.displayName ?? ""}
        user={user}
        currentPath={currentPath}
        adminEditHref={`/dashboard/admin/creators/${creator.id}/update`}
      >
        <Page>
          {isMobile ? (
            <CreatorDetailMobile
              creator={creator}
              user={user}
              currentPath={currentPath}
              showCreatorsTab={relatedCreators.length > 0}
              result={result}
            />
          ) : (
            <CreatorDetailDesktop
              creator={creator}
              user={user}
              currentPath={currentPath}
              relatedCreators={relatedCreators}
              result={result}
            />
          )}
        </Page>
      </AppLayout>,
    );
  },
);

type CreatorDetailMobileProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: {
    books: BookCardResult[];
    totalPages: number;
    page: number;
  };
  showCreatorsTab: boolean;
};

const CreatorDetailMobile = ({
  creator,
  user,
  currentPath,
  result,
  showCreatorsTab,
}: CreatorDetailMobileProps) => (
  <div class="flex flex-col gap-4">
    <MobileCreatorCard creator={creator} user={user} />
    <CreatorNavTabs
      showCreatorsTab={showCreatorsTab}
      creator={creator}
      currentPath={currentPath}
    />
    <BooksGrid
      user={user}
      currentPath={currentPath}
      result={result}
      currentCreatorId={creator.id}
      noResultsMessage="No books found"
    />
  </div>
);

type CreatorDetailDesktopProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  relatedCreators: CreatorCardResult[];
  result: {
    books: BookCardResult[];
    totalPages: number;
    page: number;
  };
};

export const CreatorDetailDesktop = ({
  creator,
  user,
  currentPath,
  relatedCreators,
  result,
}: CreatorDetailDesktopProps) => {
  const title = creator.type === "publisher" ? "Artists" : "Publishers";

  return (
    <div class="flex flex-col md:flex-row gap-4">
      <div class="md:w-4/5 flex flex-col gap-4">
        <BooksGrid
          isFullWidth={false}
          title="Books"
          user={user}
          currentPath={currentPath}
          result={result}
          currentCreatorId={creator.id}
          noResultsMessage="No books found"
        />
        <Divider />
        <CreatorsGrid creators={relatedCreators} title={title} />
      </div>
      <div class="md:w-1/5">
        <CreatorCard creator={creator} currentPath={currentPath} user={user} />
      </div>
    </div>
  );
};
