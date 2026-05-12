import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import { getBookBySlug } from "../../../../../../features/app/services";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const hv = hyperview(c);
  const proto = c.req.header("x-forwarded-proto") ?? "http";
  const host = c.req.header("host") ?? "localhost:5173";
  const baseUrl = `${proto}://${host}`;
  const [error, result] = await getBookBySlug(slug);

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Publisher not found.</Text>
      </view>,
      404,
    );
  }

  const { book } = result;

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <CreatorCard creator={book.publisher} baseUrl={baseUrl} />
    </view>,
  );
});
