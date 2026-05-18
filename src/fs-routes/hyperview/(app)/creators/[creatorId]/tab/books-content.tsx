import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { getBooksByCreatorSlug } from "../../../../../../features/app/services";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import type { BookCardResult } from "../../../../../../constants/queries";
import BookCard from "../../../../../../features/hyperview/components/BookCard";
import { getUser } from "../../../../../../utils";
import { likeFlagsForBooks } from "../../../../../../features/hyperview/likeFlags";
import CreatorPage from "../../../../../../features/hyperview/components/CreatorPage";
import { creatorIdSchema } from "../../../../../../schemas";
import { getBooksByCreatorId } from "../../../../../../features/dashboard/admin/creators/services";
import { getBaseUrl } from "../../../../../../lib/hyperview";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);

  const [error, result] = await getBooksByCreatorId(creatorId, currentPage);

  if (error || !result?.books || !result?.creator) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No books found.</Text>
      </view>,
      404,
    );
  }

  const { creator, books } = result;
  const user = await getUser(c);
  const likesByBookId = await likeFlagsForBooks(user, books);

  return hv(
    <CreatorPage
      books={books}
      creator={creator}
      baseUrl={baseUrl}
      user={user}
      likesByBookId={likesByBookId}
    />,
  );
});
