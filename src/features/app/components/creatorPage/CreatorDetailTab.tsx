import BooksGrid from "../BooksGrid";
import CreatorCard from "../../../../components/app/CreatorCard";
import CreatorsGrid from "../CreatorsGrid";
import Tabs from "../../../../components/app/Tabs";
import CreatorMessages from "./CreatorMessages";
import UpcomingFairsSection from "../../fairs/components/UpcomingFairsSection";
import { BookCardResult } from "../../../../constants/queries";
import { BookFair, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";

export type CreatorBooksResult = {
  creator: Creator;
  books: BookCardResult[];
  totalPages: number;
  page: number;
  relatedCreators: { creators: Creator[] };
};

export type CreatorDetailViewProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: Pick<CreatorBooksResult, "books" | "totalPages" | "page">;
  showCreatorsTab: boolean;
  showFairsTab: boolean;
  creatorsCurrentPage: number;
  isOwner: boolean;
  postCount: number;
  postsTabLabel: string;
  upcomingFairs: Array<
    Pick<
      BookFair,
      "id" | "slug" | "name" | "startDate" | "endDate" | "city" | "country"
    >
  >;
};

const CreatorDetailTabs = ({
  isMobile = false,
  creator,
  user,
  currentPath,
  result,
  showCreatorsTab,
  showFairsTab,
  creatorsCurrentPage,
  postsTabLabel,
  upcomingFairs,
}: CreatorDetailViewProps & { isMobile?: boolean }) => (
  <Tabs defaultTab="books">
    <Tabs.LinkContainer align={isMobile ? undefined : "left"}>
      <Tabs.Link tabId="books">Books</Tabs.Link>
      <Tabs.Link tabId="posts">{postsTabLabel}</Tabs.Link>
      {showCreatorsTab && (
        <Tabs.Link tabId="creators">
          {creator.type === "publisher" ? "Artists" : "Publishers"}
        </Tabs.Link>
      )}
      {showFairsTab && <Tabs.Link tabId="fairs">Fairs</Tabs.Link>}
      {isMobile && <Tabs.Link tabId="about">About</Tabs.Link>}
    </Tabs.LinkContainer>

    <Tabs.Panel tabId="books">
      <BooksGrid
        isMobile={isMobile}
        isInfiniteScroll={!isMobile}
        user={user}
        currentPath={currentPath}
        result={result}
        currentCreatorId={creator.id}
        noResultsMessage="No books found"
      />
    </Tabs.Panel>

    <Tabs.Panel tabId="posts">
      {isMobile ? (
        <CreatorMessages creatorSlug={creator.slug} user={user} />
      ) : (
        <div class="mx-auto w-full max-w-[600px]">
          <CreatorMessages creatorSlug={creator.slug} user={user} />
        </div>
      )}
    </Tabs.Panel>

    <Tabs.Panel tabId="creators">
      <CreatorsGrid
        isMobile={isMobile}
        isInfiniteScroll={isMobile}
        user={user}
        currentPage={creatorsCurrentPage}
        creatorId={creator.id}
        creatorType={creator.type}
        currentPath={currentPath}
        pageParam="creatorsPage"
      />
    </Tabs.Panel>

    <Tabs.Panel tabId="fairs">
      <UpcomingFairsSection fairs={upcomingFairs} />
    </Tabs.Panel>

    {isMobile && (
      <Tabs.Panel tabId="about">
        <CreatorCard
          creator={creator}
          currentPath={currentPath}
          user={user}
          shouldRefreshCreatorMessages
          showHeader={false}
        />
        <CreatorsGrid
          user={user}
          currentPage={creatorsCurrentPage}
          creatorId={creator.id}
          creatorType={creator.type}
          currentPath={currentPath}
          title="You may also like..."
          pageParam="creatorsPage"
        />
      </Tabs.Panel>
    )}
  </Tabs>
);

export default CreatorDetailTabs;
