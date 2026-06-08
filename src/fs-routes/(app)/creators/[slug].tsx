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
import CreatorCard from "../../../components/app/CreatorCard";
import CreatorsGrid from "../../../features/app/components/CreatorsGrid";
import Tabs from "../../../components/app/Tabs";
import CreatorMessages from "../../../features/app/components/CreatorMessages";
import { canonicalUrl, creatorDescription, pageTitle } from "../../../lib/seo";

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

    if (!user) {
      c.header("Vary", "Cookie");
      c.header(
        "Cache-Control",
        "private, max-age=120, stale-while-revalidate=600",
      );
    } else {
      c.header("Cache-Control", "private, no-store");
    }

    const title = pageTitle(creator.displayName);
    const description = creatorDescription(creator);
    const creatorCanonicalUrl = canonicalUrl(
      c.req.url,
      `/creators/${creator.slug}`,
    );

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={creatorCanonicalUrl}
        user={user}
        currentPath={currentPath}
        adminEditHref={`/dashboard/admin/creators/${creator.id}`}
        shareOg={{
          title,
          description,
          image: creator.coverUrl ?? undefined,
          url: creatorCanonicalUrl,
        }}
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
              showCreatorsTab={relatedCreators.length > 0}
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
  showCreatorsTab: boolean;
  creatorsCurrentPage: number;
};

export const CreatorDetailDesktop = ({
  creator,
  user,
  currentPath,
  creatorsCurrentPage,
  showCreatorsTab,
  result,
}: CreatorDetailDesktopProps) => (
  <div class="flex gap-4">
    <div class="md:w-4/5 flex flex-col gap-4">
      <Tabs defaultTab="books">
        <Tabs.LinkContainer align="left">
          <Tabs.Link tabId="books">Books</Tabs.Link>
          <Tabs.Link tabId="messages">Messages</Tabs.Link>
          {showCreatorsTab && (
            <Tabs.Link tabId="creators">
              {creator.type === "publisher" ? "Artists" : "Publishers"}
            </Tabs.Link>
          )}
        </Tabs.LinkContainer>
        <Tabs.Panel tabId="books">
          <BooksGrid
            isFullWidth={false}
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
            creatorId={creator.id}
            creatorType={creator.type}
            currentPath={currentPath}
            currentPage={creatorsCurrentPage}
            pageParam="creatorsPage"
          />
        </Tabs.Panel>
      </Tabs>
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
