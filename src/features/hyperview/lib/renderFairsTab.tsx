import { Context } from "hono";
import { hyperview } from "../../../lib/hxml";
import { Text } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import FairsList, {
  FairsListMessage,
} from "../components/FairsList";
import type { BookFair } from "../../../db/schema";

const PAGE_SIZE = 30;

type FairsPageResult = {
  fairs: BookFair[];
  totalPages: number;
  page: number;
};

type FairsFetchError = { reason: string };

type FetchFairs = (
  page: number,
  limit: number,
) => Promise<
  [FairsFetchError, null] | [null, FairsPageResult]
>;

export const renderFairsTab = async (
  c: Context,
  fetchFairs: FetchFairs,
  tabPath: string,
) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const loadMoreHref = `${baseUrl}/hyperview/fairs/tab/${tabPath}`;

  const [error, result] = await fetchFairs(currentPage, PAGE_SIZE);

  if (error) {
    return hv(
      <FairsListMessage>
        <Text style="featured-empty-hint">Failed to load fairs.</Text>
      </FairsListMessage>,
    );
  }

  const fairs = result?.fairs ?? [];
  const totalPages = result?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;

  if (currentPage === 1 && fairs.length === 0) {
    return hv(
      <FairsListMessage>
        <Text style="featured-empty-hint">No fairs found.</Text>
      </FairsListMessage>,
    );
  }

  const list = (
    <FairsList
      fairs={fairs}
      baseUrl={baseUrl}
      page={currentPage}
      hasMore={hasMore}
      loadMoreHref={loadMoreHref}
    />
  );

  if (currentPage > 1) {
    return hv(<view xmlns="https://hyperview.org/hyperview">{list}</view>);
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      {list}
    </view>,
  );
};
