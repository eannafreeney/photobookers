import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
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
    "publisher",
    currentPage,
  );

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Publisher not found.</Text>
      </view>,
      404,
    );
  }

  const { creators } = result;

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      {creators?.map((creator) => (
        <CreatorCard
          key={creator.id}
          creator={creator}
          baseUrl={baseUrl}
          showHeader={false}
        />
      ))}
    </view>,
  );
});
