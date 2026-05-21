import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { getCreatorsByCreatorId } from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import RelatedCreatorsList from "../../../../../../features/hyperview/components/RelatedCreatorsList";
import { creatorIdSchema } from "../../../../../../schemas";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = Number(c.req.query("page") ?? 1);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creatorId}/tab/artists`;

  const [error, result] = await getCreatorsByCreatorId(
    creatorId,
    "publisher",
    currentPage,
    3,
  );

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Failed to load artists.</Text>
      </view>,
      404,
    );
  }

  const { creators, totalPages = 1 } = result;
  const hasMore = currentPage < totalPages;

  if (currentPage === 1 && creators.length === 0) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No artists found.</Text>
      </view>,
    );
  }

  const list = (
    <RelatedCreatorsList
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

  return hv(list);
});
