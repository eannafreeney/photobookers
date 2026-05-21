import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import { getCreatorsByCreatorId } from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { creatorIdSchema } from "../../../../../../schemas";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = Number(c.req.query("page") ?? 1);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);

  const [error, result] = await getCreatorsByCreatorId(
    creatorId,
    "artist",
    currentPage,
    3,
  );

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }

  const { creators } = result;

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      {creators?.map((publisher) => (
        <CreatorCard
          key={publisher.id}
          creator={publisher}
          baseUrl={baseUrl}
          showHeader={false}
        />
      ))}
    </view>,
  );
});
