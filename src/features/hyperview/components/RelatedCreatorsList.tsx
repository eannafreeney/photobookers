import { CreatorCardResult } from "../../../constants/queries";
import { Spinner, Style } from "../../../lib/hxml-comps";
import SpotlightCreatorRow, {
  spotlightCreatorRowStyles,
} from "./spotlight/SpotlightCreatorRow";

export const RELATED_CREATORS_LOAD_MORE_ID = "related-creators-load-more";

type Props = {
  creators: CreatorCardResult[];
  baseUrl: string;
  page?: number;
  hasMore?: boolean;
  loadMoreHref?: string;
  followingByCreatorId?: Record<string, boolean>;
  role: string;
};

const RelatedCreatorsList = ({
  creators,
  page = 1,
  hasMore = false,
  loadMoreHref,
  followingByCreatorId = {},
  baseUrl,
  role,
}: Props) => {
  return (
    <view xmlns="https://hyperview.org/hyperview">
      {creators.map((creator) => (
        <SpotlightCreatorRow
          key={creator.id}
          creator={creator}
          role={role}
          baseUrl={baseUrl}
          isFollowing={followingByCreatorId[creator.id] ?? false}
        />
      ))}
      {hasMore && loadMoreHref ? (
        <view
          id={RELATED_CREATORS_LOAD_MORE_ID}
          style="related-creators-spinner"
          trigger="visible"
          once="true"
          verb="get"
          href={`${loadMoreHref}?page=${page + 1}`}
          action="replace"
        >
          <Spinner />
        </view>
      ) : null}
    </view>
  );
};

export default RelatedCreatorsList;

export const relatedCreatorsListStyles = () => (
  <>
    <Style
      id="related-creators-spinner"
      alignItems="center"
      justifyContent="center"
      paddingTop={16}
      paddingBottom={16}
    />
    {spotlightCreatorRowStyles()}
  </>
);
