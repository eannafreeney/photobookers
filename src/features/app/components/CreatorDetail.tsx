import { BookCardResult } from "../../../constants/queries";
import FollowButton from "../../api/components/FollowButton";
import ShareButton from "../../api/components/ShareButton";
import BooksGrid from "./BooksGrid";
import CreatorCard from "../../../components/app/CreatorCard";
import CreatorsGrid from "./CreatorsGrid";
import Tabs from "../../../components/app/Tabs";
import CreatorMessages from "./CreatorMessages";
import CreatorPageBanner from "./CreatorPageBanner";
import { Creator } from "../../../db/schema";
import { AuthUser } from "../../../../types";
import { creatorUrl } from "../spotlightUrls";
import { creatorShareText } from "../../../lib/share";
import ExpandableDescription from "./ExpandableDescription";
import MobileHeader from "./MobileHeader";

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

const CreatorBio = ({
  creator,
  maxWords = 75,
}: {
  creator: Creator;
  maxWords?: number;
}) => {
  const bio = creator.bio?.trim() || null;
  if (!bio) return null;
  return <ExpandableDescription text={bio} maxWords={maxWords} />;
};

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
    <MobileHeader
      kicker={creator.type === "publisher" ? "Publisher" : "Artist"}
      title={creator.displayName}
    >
      <FollowButton creator={creator} variant="mobile" user={user} />
    </MobileHeader>
    <div class="flex flex-col gap-1 border-b-2 border-on-surface-strong pb-3">
      <span class="kicker text-accent">
        {creator.type === "publisher" ? "Publisher" : "Artist"}
      </span>
      <h1 class="font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance pb-1">
        {creator.displayName}
      </h1>
      <FollowButton creator={creator} variant="mobile" user={user} />
    </div>
    <CreatorPageBanner
      bannerUrl={creator.bannerUrl}
      displayName={creator.displayName}
    />
    <CreatorBio creator={creator} maxWords={25} />
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
        <ShareButton
          title={creator.displayName}
          text={creatorShareText(creator)}
          url={creatorUrl(creator.slug)}
        />
      </Tabs.Panel>
      <Tabs.Panel tabId="messages">
        <CreatorMessages creatorSlug={creator.slug} user={user} />
      </Tabs.Panel>
      <Tabs.Panel tabId="creators">
        <CreatorsGrid
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
}: CreatorDetailDesktopProps) => {
  return (
    <div class="flex flex-col gap-4">
      <div class="flex justify-between border-b-2 border-on-surface-strong pb-4">
        <div class="flex flex-col gap-1 ">
          <span class="kicker text-accent">
            {creator.type === "publisher" ? "Publisher" : "Artist"}
          </span>
          <h1 class="font-display text-4xl md:text-6xl font-medium leading-tight text-on-surface-strong text-balance">
            {creator.displayName}
          </h1>
        </div>
        <div class="flex justify-end items-end">
          <ShareButton
            title={creator.displayName}
            text={creatorShareText(creator)}
            url={creatorUrl(creator.slug)}
          />
        </div>
      </div>
      <CreatorPageBanner
        bannerUrl={creator.bannerUrl}
        displayName={creator.displayName}
      />
      <div class="flex gap-4">
        <div class="md:w-4/5 flex flex-col gap-4">
          <CreatorBio creator={creator} />
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
          <div class="mt-5 flex flex-col gap-3">
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
    </div>
  );
};
