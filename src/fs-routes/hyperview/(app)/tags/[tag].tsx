import { createRoute } from "hono-fsr";
import { getBaseUrl } from "../../../../lib/hyperview";
import { paramValidator } from "../../../../lib/validator";
import { getBooksByTag } from "../../../../features/app/services";
import { tagSchema } from "../../../../features/app/schema";
import { hyperview } from "../../../../lib/hxml";
import { capitalize, getUser } from "../../../../utils";
import { favoriteFlagsForBooks } from "../../../../features/hyperview/findFlags";
import { AppLayout } from "../../+layout";
import { bookCardStyles } from "../../../../features/hyperview/components/BookCard";
import FeedList, {
  feedListStyles,
} from "../../../../features/hyperview/components/FeedList";
import { signInEmptyHintStyles } from "../../../../features/hyperview/hyperviewCommonScreenStyles";
import { Text, View } from "../../../../lib/hxml-comps";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen";

export const TAG_BOOKS_LOAD_MORE_ID = "tag-books-load-more";

export const GET = createRoute(paramValidator(tagSchema), async (c) => {
  const tag = c.req.valid("param").tag;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const loadMoreHref = `${baseUrl}/hyperview/tags/${encodeURIComponent(tag)}`;

  const [error, result] = await getBooksByTag(tag, currentPage);
  const hv = hyperview(c);

  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
    );
  }

  const { books, totalPages = 1 } = result;
  const hasMore = currentPage < totalPages;
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const pageTitle = `# ${capitalize(tag)}`;

  if (currentPage === 1 && books.length === 0) {
    return hv(
      <AppLayout
        title={pageTitle}
        extraStyles={pageStyles()}
        showDock
        dockScrollRefreshHref={loadMoreHref}
      >
        <View id="page-content" style="page-content">
          <Text style="featured-empty-hint">No books found for this tag.</Text>
        </View>
      </AppLayout>,
    );
  }

  const list = (
    <FeedList
      books={books}
      baseUrl={baseUrl}
      favoritesByBookId={favoritesByBookId}
      page={currentPage}
      hasMore={hasMore}
      loadMoreHref={loadMoreHref}
      loadMoreId={TAG_BOOKS_LOAD_MORE_ID}
    />
  );

  if (currentPage > 1) {
    return hv(<view xmlns="https://hyperview.org/hyperview">{list}</view>);
  }

  return hv(
    <AppLayout title={pageTitle} extraStyles={pageStyles()}>
      <View id="page-content" style="page-content">
        {list}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    {bookCardStyles()}
    {feedListStyles()}
  </>
);
