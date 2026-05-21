import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import { getBooksByCreatorSlug } from "../../../../../../features/app/services";
import { paramValidator } from "../../../../../../lib/validator";
import { slugSchema } from "../../../../../../features/app/schema";
import { getUser } from "../../../../../../utils";
import { favoriteFlagsForBooks } from "../../../../../../features/hyperview/findFlags";
import CreatorPage from "../../../../../../features/hyperview/components/CreatorPage";
import { getBaseUrl } from "../../../../../../lib/hyperview";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  const [error, result] = await getBooksByCreatorSlug(slug, currentPage);

  if (error || !result?.creator) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No books found.</Text>
      </view>,
      404,
    );
  }

  const { creator, books, totalPages = 1 } = result;
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const hasMore = currentPage < totalPages;
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creator.id}/tab/books-content`;

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
