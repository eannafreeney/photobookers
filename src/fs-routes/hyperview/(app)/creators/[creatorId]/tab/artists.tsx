import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { getCreatorsByCreatorId } from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Style, Text, View } from "../../../../../../lib/hxml-comps";
import { getUser } from "../../../../../../utils";
import { followFlagsForCreators } from "../../../../../../features/hyperview/findFlags";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import RelatedCreatorsList from "../../../../../../features/hyperview/components/RelatedCreatorsList";
import { creatorIdSchema } from "../../../../../../schemas";
import SpotlightCreatorRow, {
  spotlightCreatorRowStyles,
} from "../../../../../../features/hyperview/components/spotlight/SpotlightCreatorRow";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = Number(c.req.query("page") ?? 1);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
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
  const followingByCreatorId = await followFlagsForCreators(user, creators);

  if (currentPage === 1 && creators.length === 0) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No artists found.</Text>
      </view>,
    );
  }

  const list = (
    <View style="related-creators-list">
      {creators?.map((artist) => (
        <SpotlightCreatorRow
          creator={artist}
          role="Artist"
          baseUrl={baseUrl}
          isFollowing={followingByCreatorId[artist.id] ?? false}
        />
      ))}
    </View>
  );

  if (currentPage > 1) {
    return hv(<view xmlns="https://hyperview.org/hyperview">{list}</view>);
  }

  return hv(list);
});

export const artistsListStyles = () => (
  <>
    <Style id="related-creators-list" flexDirection="column" gap={12} />
    {spotlightCreatorRowStyles()}
  </>
);
