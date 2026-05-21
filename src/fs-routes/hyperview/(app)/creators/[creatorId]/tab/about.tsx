import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { getCreatorById } from "../../../../../../features/dashboard/creators/services";
import { creatorIdSchema } from "../../../../../../schemas";
import CreatorSocialLinks from "../../../../../../features/hyperview/components/CreatorSocialLinks";
import { getBaseUrl } from "../../../../../../lib/hyperview";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);

  const [error, creator] = await getCreatorById(creatorId);

  if (error || !creator) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <Text style="comments-placeholder">
        {creator.bio ?? "No bio available"}
      </Text>
      <CreatorSocialLinks
        baseUrl={baseUrl}
        website={creator.website}
        instagram={creator.instagram}
        twitter={creator.twitter}
        facebook={creator.facebook}
      />
    </view>,
  );
});
