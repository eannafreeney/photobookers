import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { bookIdSchema } from "../../../../../../schemas";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getUser } from "../../../../../../utils";
import { followFlagsForCreators } from "../../../../../../features/hyperview/findFlags";
import { getArtistByBookId } from "../../../../../../features/dashboard/books/services";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [error, artist] = await getArtistByBookId(bookId);

  if (error || !artist) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }

  const followingByCreatorId = await followFlagsForCreators(user, [artist]);

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <CreatorCard
        creator={artist}
        baseUrl={baseUrl}
        showHeader={false}
        isFollowing={followingByCreatorId[artist.id] ?? false}
      />
    </view>,
  );
});
