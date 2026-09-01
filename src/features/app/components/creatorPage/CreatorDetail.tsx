import { BookFair, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import CreatorDetailMobile from "./CreatorDetailMobile";
import CreatorDetailDesktop from "./CreatorDetailDesktop";
import { CreatorBooksResult } from "./CreatorDetailTab";

type CreatorDetailProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: CreatorBooksResult;
  creatorsCurrentPage: number;
  isMobile: boolean;
  postCount: number;
  upcomingFairs: Array<
    Pick<
      BookFair,
      "id" | "slug" | "name" | "startDate" | "endDate" | "city" | "country"
    >
  >;
  spotlightKicker?: string | null;
};

const CreatorDetail = ({
  creator,
  user,
  currentPath,
  result,
  creatorsCurrentPage,
  isMobile,
  postCount,
  upcomingFairs,
  spotlightKicker,
}: CreatorDetailProps) => {
  const showCreatorsTab = result.relatedCreators.creators.length > 0;
  const showFairsTab = upcomingFairs.length > 0;
  const showPostsTab = postCount > 0;
  const isOwner = user?.creator?.id === creator.id;

  return isMobile ? (
    <CreatorDetailMobile
      creator={creator}
      user={user}
      currentPath={currentPath}
      showCreatorsTab={showCreatorsTab}
      showFairsTab={showFairsTab}
      showPostsTab={showPostsTab}
      result={result}
      creatorsCurrentPage={creatorsCurrentPage}
      upcomingFairs={upcomingFairs}
      isOwner={isOwner}
      postCount={postCount}
      spotlightKicker={spotlightKicker}
    />
  ) : (
    <CreatorDetailDesktop
      creator={creator}
      user={user}
      currentPath={currentPath}
      showCreatorsTab={showCreatorsTab}
      showFairsTab={showFairsTab}
      showPostsTab={showPostsTab}
      result={result}
      creatorsCurrentPage={creatorsCurrentPage}
      upcomingFairs={upcomingFairs}
      isOwner={isOwner}
      postCount={postCount}
      spotlightKicker={spotlightKicker}
    />
  );
};

export default CreatorDetail;
