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
import { BookCardResult } from "../../../constants/queries";
import { AuthUser } from "../../../../types";
import { Creator } from "../../../db/schema";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import BooksGrid from "../../../features/app/components/BooksGrid";
import Divider from "../../../components/Divider";
import CreatorCard from "../../../components/app/CreatorCard";
import CreatorsGrid from "../../../features/app/components/CreatorsGrid";
import Tabs from "../../../components/app/Tabs";
import CreatorMessages from "../../../features/app/components/CreatorMessages";

export const GET = createRoute(
  paramValidator(slugSchema),
  async (c: Context) => {
    const slug = c.req.param("slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);
    const creatorsCurrentPage = Number(c.req.query("creatorsPage") ?? 1);
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
        adminEditHref={`/dashboard/admin/creators/${creator.id}`}
      >
        <Page>
          {isMobile ? (
            <CreatorDetailMobile
              creator={creator}
              user={user}
              currentPath={currentPath}
              showCreatorsTab={relatedCreators.length > 0}
              result={result}
              creatorsCurrentPage={creatorsCurrentPage}
            />
          ) : (
            <CreatorDetailDesktop
              creator={creator}
              user={user}
              currentPath={currentPath}
              result={result}
              creatorsCurrentPage={creatorsCurrentPage}
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
  creatorsCurrentPage: number;
};

const CreatorDetailMobile = ({
  creator,
  user,
  currentPath,
  result,
  showCreatorsTab,
  creatorsCurrentPage,
}: CreatorDetailMobileProps) => (
  <div class="flex flex-col gap-4">
    <MobileCreatorCard creator={creator} user={user} />
    <Tabs defaultTab="books">
      <Tabs.LinkContainer>
        <Tabs.Link tabId="books">Books</Tabs.Link>
        <Tabs.Link tabId="messages">Messages</Tabs.Link>
        {showCreatorsTab && (
          <Tabs.Link tabId="creators">
            {creator.type === "publisher" ? "Artists" : "Publishers"}
          </Tabs.Link>
        )}
        <Tabs.Link tabId="about">About</Tabs.Link>
      </Tabs.LinkContainer>
      <Tabs.Panel tabId="books">
        <BooksGrid
          isMobile
          user={user}
          currentPath={currentPath}
          result={result}
          currentCreatorId={creator.id}
          noResultsMessage="No books found"
        />
      </Tabs.Panel>
      <Tabs.Panel tabId="messages">
        <CreatorMessages creatorSlug={creator.slug} user={user} />
      </Tabs.Panel>
      <Tabs.Panel tabId="creators">
        <CreatorsGrid
          isMobile
          currentPage={creatorsCurrentPage}
          creatorId={creator.id}
          creatorType={creator.type}
          currentPath={currentPath}
          pageParam="creatorsPage"
        />
      </Tabs.Panel>
      <Tabs.Panel tabId="about">
        <CreatorCard
          creator={creator}
          currentPath={currentPath}
          user={user}
          shouldRefreshCreatorMessages
        />
        <CreatorsGrid
          isMobile
          currentPage={creatorsCurrentPage}
          creatorId={creator.id}
          creatorType={creator.type}
          currentPath={currentPath}
          title="You may also like..."
          pageParam="creatorsPage"
        />
      </Tabs.Panel>
    </Tabs>
  </div>
);

type CreatorDetailDesktopProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: {
    books: BookCardResult[];
    totalPages: number;
    page: number;
  };
  creatorsCurrentPage: number;
};

export const CreatorDetailDesktop = ({
  creator,
  user,
  currentPath,
  creatorsCurrentPage,
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
        <div class="grid grid-cols-2 divide-x divide-outline">
          <div class="pr-8">
            <CreatorMessages creatorSlug={creator.slug} user={user} />
          </div>
          <div class="pl-8">
            <CreatorsGrid
              creatorId={creator.id}
              creatorType={creator.type}
              title={title}
              currentPath={currentPath}
              currentPage={creatorsCurrentPage}
              pageParam="creatorsPage"
            />
          </div>
        </div>
      </div>
      <div class="md:w-1/5">
        <CreatorCard
          creator={creator}
          currentPath={currentPath}
          user={user}
          title="About"
          shouldRefreshCreatorMessages
        />
      </div>
    </div>
  );
};
