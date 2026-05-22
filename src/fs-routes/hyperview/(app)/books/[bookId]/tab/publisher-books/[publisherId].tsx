import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../../lib/validator";
import { hyperview } from "../../../../../../../lib/hxml";
import { Style, Text } from "../../../../../../../lib/hxml-comps";
import type { BookCardResult } from "../../../../../../../constants/queries";
import { CREATOR_BOOKS_LOAD_MORE_ID } from "../../../../../../../features/hyperview/components/CreatorPage";
import FeedList, {
  feedListStyles,
} from "../../../../../../../features/hyperview/components/FeedList";
import { bookPublisherIdSchema } from "../../../../../../../schemas";
import { getBaseUrl } from "../../../../../../../lib/hyperview";
import { getUser } from "../../../../../../../utils";
import { favoriteFlagsForBooks } from "../../../../../../../features/hyperview/findFlags";
import { getBooksPerPublisherId } from "../../../../../../../features/dashboard/books/services";

/** Target for lazy-load `replace` on the artist tab (must match artist.tsx). */
export const BOOK_PUBLISHER_FEED_ID = "book-publisher-feed";

export const GET = createRoute(
  paramValidator(bookPublisherIdSchema),
  async (c) => {
    const { bookId, publisherId } = c.req.valid("param");
    const currentPage = parseInt(c.req.query("page") ?? "1", 10);
    const hv = hyperview(c);
    const baseUrl = getBaseUrl(c);
    const user = await getUser(c);
    const loadMoreHref = `${baseUrl}/hyperview/books/${bookId}/tab/publisher-books/${publisherId}`;

    const [error, result] = await getBooksPerPublisherId(
      publisherId,
      currentPage,
    );

    if (error || !result?.publisher) {
      return hv(
        <view xmlns="https://hyperview.org/hyperview">
          <Text style="comments-placeholder">Could not load books.</Text>
        </view>,
        404,
      );
    }

    const { publisher, books, totalPages = 1 } = result;
    const favoritesByBookId = await favoriteFlagsForBooks(user, books);
    const hasMore = currentPage < totalPages;

    if (books.length === 0) {
      return hv(
        <view xmlns="https://hyperview.org/hyperview">
          <Text style="comments-placeholder">No books by this artist yet.</Text>
        </view>,
      );
    }

    const feedList = (
      <FeedList
        books={books as BookCardResult[]}
        baseUrl={baseUrl}
        favoritesByBookId={favoritesByBookId}
        page={currentPage}
        hasMore={hasMore}
        loadMoreHref={loadMoreHref}
        loadMoreId={CREATOR_BOOKS_LOAD_MORE_ID}
        currentCreatorId={publisher.id}
      />
    );

    if (currentPage > 1) {
      return hv(
        <view xmlns="https://hyperview.org/hyperview">{feedList}</view>,
      );
    }

    return hv(<view xmlns="https://hyperview.org/hyperview">{feedList}</view>);
  },
);

export const artistBooksLazyStyles = () => (
  <>
    {feedListStyles()}
    <Style
      id="artist-books-lazy"
      alignItems="center"
      justifyContent="center"
      paddingTop={24}
      paddingBottom={24}
      minHeight={120}
    />
  </>
);
