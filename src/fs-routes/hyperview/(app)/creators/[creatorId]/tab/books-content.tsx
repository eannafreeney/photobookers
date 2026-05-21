import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { paramValidator } from "../../../../../../lib/validator";
import { getUser } from "../../../../../../utils";
import { favoriteFlagsForBooks } from "../../../../../../features/hyperview/findFlags";
import CreatorPage from "../../../../../../features/hyperview/components/CreatorPage";
import { creatorIdSchema } from "../../../../../../schemas";
import { getBooksByCreatorId } from "../../../../../../features/dashboard/admin/creators/services";
import { getBaseUrl } from "../../../../../../lib/hyperview";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creatorId}/tab/books-content`;

  const [error, result] = await getBooksByCreatorId(creatorId, currentPage);

  if (error || !result?.books || !result?.creator) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No books found.</Text>
      </view>,
      404,
    );
  }

  const { creator, books, totalPages = 1 } = result;
  const user = await getUser(c);
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const hasMore = currentPage < totalPages;

  const pageProps = {
    books,
    creator,
    baseUrl,
    favoritesByBookId,
    page: currentPage,
    hasMore,
    loadMoreHref,
  };

  if (currentPage > 1) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <CreatorPage {...pageProps} />
      </view>,
    );
  }

  return hv(<CreatorPage {...pageProps} />);
});
