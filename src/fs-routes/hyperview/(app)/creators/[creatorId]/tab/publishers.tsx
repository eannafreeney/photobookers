import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { getCreatorsByCreatorId } from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Style, Text } from "../../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getUser } from "../../../../../../utils";
import { followFlagsForCreators } from "../../../../../../features/hyperview/findFlags";
import RelatedCreatorsList, {
  relatedCreatorsListStyles,
} from "../../../../../../features/hyperview/components/RelatedCreatorsList";
import { creatorIdSchema } from "../../../../../../schemas";
import { followButtonStyles } from "../../../../../../features/hyperview/components/FollowButton";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = Number(c.req.query("page") ?? 1);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [error, result] = await getCreatorsByCreatorId(
    creatorId,
    "artist",
    currentPage,
  );

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }

  const { creators, totalPages = 1 } = result;
  const hasMore = currentPage < totalPages;
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creatorId}/tab/publishers`;
  const followingByCreatorId = await followFlagsForCreators(
    user,
    creators ?? [],
  );

  if (currentPage === 1 && creators.length === 0) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No publishers found.</Text>
      </view>,
    );
  }

  const list = (
    <RelatedCreatorsList
      creators={creators}
      role="Publisher"
      baseUrl={baseUrl}
      page={currentPage}
      hasMore={hasMore}
      loadMoreHref={loadMoreHref}
      followingByCreatorId={followingByCreatorId}
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

export const publishersListStyles = () => (
  <>
    <Style id="related-creators-list" flexDirection="column" gap={12} />
    {relatedCreatorsListStyles()}
    {followButtonStyles()}
  </>
);
