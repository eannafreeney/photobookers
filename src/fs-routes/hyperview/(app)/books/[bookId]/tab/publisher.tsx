import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getPublisherByBookId } from "../../../../../../features/dashboard/books/services";
import { bookIdSchema } from "../../../../../../schemas";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);

  const [error, publisher] = await getPublisherByBookId(bookId);

  if (error || !publisher) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <Text style="comments-placeholder">Publisher not found.</Text>
      </view>,
      404,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <CreatorCard creator={publisher} baseUrl={baseUrl} showHeader={false} />
    </view>,
  );
});
