import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { getBooksByCreatorSlug } from "../../../../../../features/app/services";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import { getUser } from "../../../../../../utils";
import { wishlistFlagsForBooks } from "../../../../../../features/hyperview/findFlags";
import CreatorPage from "../../../../../../features/hyperview/components/CreatorPage";
import { getBaseUrl } from "../../../../../../lib/hyperview";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [error, result] = await getBooksByCreatorSlug(slug);

  if (error || !result?.creator) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No books found.</Text>
      </view>,
      404,
    );
  }

  const { creator, books } = result;

  const wishlistsByBookId = await wishlistFlagsForBooks(user, books);

  return hv(
    <CreatorPage
      books={books}
      creator={creator}
      baseUrl={baseUrl}
      wishlistsByBookId={wishlistsByBookId}
    />,
  );
});
