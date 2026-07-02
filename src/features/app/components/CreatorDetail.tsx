import { BookCardResult } from "../../../constants/queries";
import FollowButton from "../../api/components/FollowButton";
import ShareButton from "../../api/components/ShareButton";
import BooksGrid from "./BooksGrid";
import CreatorCard from "../../../components/app/CreatorCard";
import CreatorsGrid from "./CreatorsGrid";
import Tabs from "../../../components/app/Tabs";
import CreatorMessages from "./CreatorMessages";
import CreatorPageBanner from "./CreatorPageBanner";
import { BookFair, Creator } from "../../../db/schema";
import { AuthUser } from "../../../../types";
import { creatorUrl } from "../spotlightUrls";
import { creatorShareText } from "../../../lib/share";
import { formatCountry } from "../../../lib/utils";
import ExpandableDescription from "./ExpandableDescription";
import MobileHeader from "./MobileHeader";
import UpcomingFairsSection from "../fairs/components/UpcomingFairsSection";
import SocialLinks from "../../../components/app/SocialLinks";
import ClaimCreatorBtn from "../../claims/components/ClaimCreatorBtn";
import FollowersCount from "../../../components/app/FollowersCount";
import VerifiedCreator from "../../../components/app/VerifiedCreator";
import { findFollowersCount } from "../../../db/queries";
export type CreatorBooksResult = {
  creator: Creator;
  books: BookCardResult[];
  totalPages: number;
  page: number;
  relatedCreators: { creators: Creator[] };
};

type CreatorDetailProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: CreatorBooksResult;
  creatorsCurrentPage: number;
  isMobile: boolean;
  upcomingFairs: Array<
    Pick<
      BookFair,
      "id" | "slug" | "name" | "startDate" | "endDate" | "city" | "country"
    >
  >;
};

const CreatorDetail = ({
  creator,
  user,
  currentPath,
  result,
  creatorsCurrentPage,
  isMobile,
  upcomingFairs,
}: CreatorDetailProps) => {
  const showCreatorsTab = result.relatedCreators.creators.length > 0;
  const showFairsTab = upcomingFairs.length > 0;

  return isMobile ? (
    <CreatorDetailMobile
      creator={creator}
      user={user}
      currentPath={currentPath}
      showCreatorsTab={showCreatorsTab}
      showFairsTab={showFairsTab}
      result={result}
      creatorsCurrentPage={creatorsCurrentPage}
      upcomingFairs={upcomingFairs}
    />
  ) : (
    <CreatorDetailDesktop
      creator={creator}
      user={user}
      currentPath={currentPath}
      showCreatorsTab={showCreatorsTab}
      showFairsTab={showFairsTab}
      result={result}
      creatorsCurrentPage={creatorsCurrentPage}
      upcomingFairs={upcomingFairs}
    />
  );
};

export default CreatorDetail;

const CreatorBio = async ({
  creator,
  maxWords = 75,
}: {
  creator: Creator;
  maxWords?: number;
}) => {
  const bio = creator.bio?.trim() || null;
  if (!bio)
    return (
      <div class="flex justify-center">
        <CreatorBioMeta creator={creator} />
      </div>
    );
  return (
    <div class="flex flex-col gap-2">
      <ExpandableDescription text={bio} maxWords={maxWords} />
      <CreatorBioMeta creator={creator} />
    </div>
  );
};

const CreatorBioSection = async ({
  creator,
  maxWords = 75,
}: {
  creator: Creator;
  maxWords?: number;
}) => {
  const followerCount = await findFollowersCount(creator.id);
  const hasLocation = !!(creator.city || creator.country);
  const hasFollowers = followerCount > 0;
  const hasSocials = !!(
    creator.website ||
    creator.facebook ||
    creator.instagram ||
    creator.twitter
  );
  const hasMeta = hasLocation || hasFollowers || hasSocials;
  const bio = creator.bio?.trim() || null;

  if (!bio) {
    if (!hasMeta) return <></>;
    return (
      <div class="flex justify-center">
        <CreatorBioMeta
          creator={creator}
          variant="inline"
          followerCount={followerCount}
        />
      </div>
    );
  }

  if (!hasMeta) {
    return <ExpandableDescription text={bio} maxWords={maxWords} />;
  }

  return (
    <div class="flex gap-6">
      <div class="w-4/5 min-w-0">
        <ExpandableDescription text={bio} maxWords={maxWords} />
      </div>
      <div class="flex w-1/5 flex-col items-end text-right">
        <CreatorBioMeta
          creator={creator}
          variant="stacked"
          align="right"
          followerCount={followerCount}
        />
      </div>
    </div>
  );
};

const CreatorAvatar = ({
  creator,
  class: className = "size-16",
}: {
  creator: Creator;
  class?: string;
}) => (
  <div class="relative shrink-0">
    {creator.coverUrl ? (
      <img
        src={creator.coverUrl}
        alt={creator.displayName}
        class={`${className} rounded-full border border-outline object-cover`}
      />
    ) : (
      <span
        class={`flex ${className} items-center justify-center rounded-full border border-outline bg-surface-alt text-lg font-semibold text-on-surface`}
        aria-hidden="true"
      >
        {creator.displayName.charAt(0)}
      </span>
    )}
    <div class="absolute -top-0.5 -right-0.5">
      <VerifiedCreator creatorStatus={creator.status ?? "stub"} size="xs" />
    </div>
  </div>
);

type CreatorDetailMobileProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: Pick<CreatorBooksResult, "books" | "totalPages" | "page">;
  showCreatorsTab: boolean;
  showFairsTab: boolean;
  creatorsCurrentPage: number;
  upcomingFairs: Array<
    Pick<
      BookFair,
      "id" | "slug" | "name" | "startDate" | "endDate" | "city" | "country"
    >
  >;
};

const CreatorDetailMobile = ({
  creator,
  user,
  currentPath,
  result,
  showCreatorsTab,
  showFairsTab,
  creatorsCurrentPage,
  upcomingFairs,
}: CreatorDetailMobileProps) => (
  <>
    <CreatorPageBanner
      bannerUrl={creator.bannerUrl}
      displayName={creator.displayName}
    />
    <div class="flex flex-col gap-4">
      <MobileHeader
        kicker={creator.type === "publisher" ? "Publisher" : "Artist"}
        title={creator.displayName}
      >
        <div class="flex justify-between items-center gap-2">
          <FollowButton creator={creator} variant="mobile" user={user} />
          <ShareButton
            title={creator.displayName}
            text={creatorShareText(creator)}
            url={creatorUrl(creator.slug)}
          />
        </div>
      </MobileHeader>
      {/* <CreatorBio creator={creator} maxWords={25} /> */}
      <Tabs defaultTab="books">
        <Tabs.LinkContainer>
          <Tabs.Link tabId="books">Books</Tabs.Link>
          <Tabs.Link tabId="messages">Messages</Tabs.Link>
          {showCreatorsTab && (
            <Tabs.Link tabId="creators">
              {creator.type === "publisher" ? "Artists" : "Publishers"}
            </Tabs.Link>
          )}
          {showFairsTab && <Tabs.Link tabId="fairs">Fairs</Tabs.Link>}
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
      </Tabs>
    </div>
  </>
);

type CreatorDetailDesktopProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: Pick<CreatorBooksResult, "books" | "totalPages" | "page">;
  showCreatorsTab: boolean;
  showFairsTab: boolean;
  creatorsCurrentPage: number;
  upcomingFairs: Array<
    Pick<
      BookFair,
      "id" | "slug" | "name" | "startDate" | "endDate" | "city" | "country"
    >
  >;
};

const CreatorDetailDesktop = ({
  creator,
  user,
  currentPath,
  creatorsCurrentPage,
  showCreatorsTab,
  showFairsTab,
  result,
  upcomingFairs,
}: CreatorDetailDesktopProps) => {
  return (
    <div class="flex flex-col gap-4">
      <CreatorPageBanner
        bannerUrl={creator.bannerUrl}
        displayName={creator.displayName}
      />
      <div class="flex justify-between border-b-2 border-on-surface-strong pb-4">
        <div class="flex flex-col gap-1">
          <span class="kicker text-accent">
            {creator.type === "publisher" ? "Publisher" : "Artist"}
          </span>
          <div class="flex items-center gap-4">
            <CreatorAvatar creator={creator} />
            <h1 class="text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-6xl">
              {creator.displayName}
            </h1>
          </div>
        </div>
        <div class="flex flex-col items-end justify-end gap-3">
          <div class="grid grid-cols-2 gap-4">
            <FollowButton
              creator={creator}
              user={user}
              shouldRefreshCreatorMessages
            />
            <ShareButton
              title={creator.displayName}
              text={creatorShareText(creator)}
              url={creatorUrl(creator.slug)}
            />
          </div>
          <ClaimCreatorBtn
            creator={creator}
            user={user}
            currentPath={currentPath}
          />
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <CreatorBioSection creator={creator} />
        <Tabs defaultTab="books">
          <Tabs.LinkContainer align="left">
            <Tabs.Link tabId="books">Books</Tabs.Link>
            <Tabs.Link tabId="messages">Messages</Tabs.Link>
            {showCreatorsTab && (
              <Tabs.Link tabId="creators">
                {creator.type === "publisher" ? "Artists" : "Publishers"}
              </Tabs.Link>
            )}
            {showFairsTab && <Tabs.Link tabId="fairs">Fairs</Tabs.Link>}
          </Tabs.LinkContainer>
          <Tabs.Panel tabId="books">
            <BooksGrid
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
              user={user}
              creatorId={creator.id}
              creatorType={creator.type}
              currentPath={currentPath}
              currentPage={creatorsCurrentPage}
              pageParam="creatorsPage"
            />
          </Tabs.Panel>
          <Tabs.Panel tabId="fairs">
            <UpcomingFairsSection fairs={upcomingFairs} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

type CreatorBioMetaProps = {
  creator: Creator;
  variant?: "inline" | "stacked";
  align?: "left" | "right";
  followerCount?: number;
};

const CreatorBioMeta = async ({
  creator,
  variant = "inline",
  align = "left",
  followerCount: followerCountProp,
}: CreatorBioMetaProps) => {
  const followerCount =
    followerCountProp ?? (await findFollowersCount(creator.id));
  const hasLocation = !!(creator.city || creator.country);
  const hasFollowers = followerCount > 0;
  const hasSocials = !!(
    creator.website ||
    creator.facebook ||
    creator.instagram ||
    creator.twitter
  );

  if (!hasLocation && !hasFollowers && !hasSocials) return <></>;

  if (variant === "stacked") {
    return (
      <div
        class={`flex flex-col gap-2 text-sm text-on-surface ${align === "right" ? "items-end text-right" : ""}`}
      >
        {hasLocation && (
          <span>
            {creator.city ? `${creator.city}, ` : ""}
            {formatCountry(creator.country ?? "")}
          </span>
        )}
        {hasFollowers && <FollowersCount count={followerCount} />}
        {hasSocials && (
          <SocialLinks
            creator={creator}
            className={`flex items-center gap-3 ${align === "right" ? "justify-end" : ""}`}
          />
        )}
      </div>
    );
  }

  return (
    <div class="flex items-center justify-center gap-3 text-sm text-on-surface">
      {hasLocation && (
        <span>
          {creator.city ? `${creator.city}, ` : ""}
          {formatCountry(creator.country ?? "")}
        </span>
      )}
      {hasFollowers && (
        <>
          {hasLocation && (
            <span aria-hidden="true" class="text-on-surface-weak">
              ·
            </span>
          )}
          <FollowersCount count={followerCount} />
        </>
      )}
      {hasSocials && (
        <>
          {(hasLocation || hasFollowers) && (
            <span aria-hidden="true" class="text-on-surface-weak">
              ·
            </span>
          )}
          <SocialLinks
            creator={creator}
            className="inline-flex items-center gap-3"
          />
        </>
      )}
    </div>
  );
};
