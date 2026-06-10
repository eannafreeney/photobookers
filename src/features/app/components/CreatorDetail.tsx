import { BookCardResult } from "../../../constants/queries";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import BooksGrid from "./BooksGrid";
import CreatorCard from "../../../components/app/CreatorCard";
import CreatorsGrid from "./CreatorsGrid";
import Tabs from "../../../components/app/Tabs";
import CreatorMessages from "./CreatorMessages";
import CreatorPageBanner from "./CreatorPageBanner";
import { Creator } from "../../../db/schema";
import { AuthUser } from "../../../../types";

export type CreatorBooksResult = {
  creator: Creator;
  books: BookCardResult[];
  totalPages: number;
  page: number;
  relatedCreators: { length: number };
};

type CreatorDetailProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: CreatorBooksResult;
  creatorsCurrentPage: number;
  isMobile: boolean;
};

const CreatorDetail = ({
  creator,
  user,
  currentPath,
  result,
  creatorsCurrentPage,
  isMobile,
}: CreatorDetailProps) => {
  const showCreatorsTab = result.relatedCreators.length > 0;

  return isMobile ? (
    <CreatorDetailMobile
      creator={creator}
      user={user}
      currentPath={currentPath}
      showCreatorsTab={showCreatorsTab}
      result={result}
      creatorsCurrentPage={creatorsCurrentPage}
    />
  ) : (
    <CreatorDetailDesktop
      creator={creator}
      user={user}
      currentPath={currentPath}
      showCreatorsTab={showCreatorsTab}
      result={result}
      creatorsCurrentPage={creatorsCurrentPage}
    />
  );
};

export default CreatorDetail;

type CreatorDetailMobileProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: Pick<CreatorBooksResult, "books" | "totalPages" | "page">;
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
    <CreatorPageBanner
      bannerUrl={creator.bannerUrl}
      displayName={creator.displayName}
    />
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
  result: Pick<CreatorBooksResult, "books" | "totalPages" | "page">;
  showCreatorsTab: boolean;
  creatorsCurrentPage: number;
};

const CreatorDetailDesktop = ({
  creator,
  user,
  currentPath,
  creatorsCurrentPage,
  showCreatorsTab,
  result,
}: CreatorDetailDesktopProps) => (
  <div class="flex flex-col gap-4">
    <CreatorPageBanner
      bannerUrl={creator.bannerUrl}
      displayName={creator.displayName}
    />
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
  </div>
);
