import { createRoute } from "hono-fsr";
import { getAllCreatorsByType } from "../../../../../features/app/services";
import { hyperview } from "../../../../../lib/hxml";
import { Text } from "../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../lib/hyperview";
import CreatorsList, {
  CreatorsListMessage,
} from "../../../../../features/hyperview/components/CreatorsList";

const PAGE_SIZE = 20;

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const loadMoreHref = `${baseUrl}/hyperview/creators/tab/artists`;

  const [error, result] = await getAllCreatorsByType(
    "artist",
    currentPage,
    PAGE_SIZE,
  );

  if (error) {
    return hv(
      <CreatorsListMessage>
        <Text style="featured-empty-hint">Failed to load artists.</Text>
      </CreatorsListMessage>,
    );
  }

  const creators = result?.creators ?? [];
  const totalPages = result?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;

  if (currentPage === 1 && creators.length === 0) {
    return hv(
      <CreatorsListMessage>
        <Text style="featured-empty-hint">No artists found.</Text>
      </CreatorsListMessage>,
    );
  }

  const list = (
    <CreatorsList
      creators={creators}
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
});
