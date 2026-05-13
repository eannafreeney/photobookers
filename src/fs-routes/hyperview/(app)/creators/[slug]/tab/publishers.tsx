import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import { getBooksByCreatorSlug } from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import CreatorsGrid from "../../../../../../features/hyperview/components/CreatorsGrid";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const hv = hyperview(c);

  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:5173";
  const baseUrl = `${proto}://${host}`;

  const currentPage = Number(c.req.query("page") ?? 1);

  const [error, result] = await getBooksByCreatorSlug(slug, currentPage);

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }

  const { creator } = result;

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <CreatorsGrid
        creatorId={creator.id}
        creatorType={creator.type}
        baseUrl={baseUrl}
        title="Publishers"
      />
    </view>,
  );
});
