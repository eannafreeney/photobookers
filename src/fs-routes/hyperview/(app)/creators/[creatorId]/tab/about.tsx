import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import { getBookBySlug } from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getBookById } from "../../../../../../features/dashboard/books/services";
import { getCreatorById } from "../../../../../../features/dashboard/creators/services";
import { creatorIdSchema } from "../../../../../../schemas";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const baseUrl = getBaseUrl(c);

  const hv = hyperview(c);

  const [error, result] = await getCreatorById(creatorId);

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <CreatorCard creator={result} baseUrl={baseUrl} />
    </view>,
  );
});
