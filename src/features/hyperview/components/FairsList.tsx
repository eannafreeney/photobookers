import { PropsWithChildren } from "hono/jsx";
import { Spinner, Style, Text, View } from "../../../lib/hxml-comps";
import type { BookFair } from "../../../db/schema";
import FairCard, { fairCardStyles } from "./FairCard";

export const FAIRS_LOAD_MORE_ID = "fairs-load-more";

type Props = {
  fairs: BookFair[];
  baseUrl: string;
  page: number;
  hasMore: boolean;
  loadMoreHref?: string;
};

const FairsList = ({ fairs, baseUrl, page, hasMore, loadMoreHref }: Props) => {
  if (fairs.length === 0) return <></>;

  return (
    <>
      {fairs.map((fair) => (
        <FairCard
          key={fair.id}
          fair={fair}
          variant="list"
          href={`${baseUrl}/hyperview/fairs/${fair.slug}`}
        />
      ))}
      {hasMore && loadMoreHref ? (
        <view
          id={FAIRS_LOAD_MORE_ID}
          style="fairs-list-spinner"
          trigger="visible"
          once="true"
          verb="get"
          href={`${loadMoreHref}?page=${page + 1}`}
          action="replace"
        >
          <Spinner />
        </view>
      ) : null}
    </>
  );
};

export default FairsList;

type MessageProps = PropsWithChildren;

export const FairsListMessage = ({ children }: MessageProps) => (
  <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
    {children}
  </view>
);

export const fairsListStyles = () => (
  <>
    {fairCardStyles()}
    <Style
      id="fairs-list-spinner"
      alignItems="center"
      justifyContent="center"
      paddingTop={16}
      paddingBottom={16}
    />
  </>
);
