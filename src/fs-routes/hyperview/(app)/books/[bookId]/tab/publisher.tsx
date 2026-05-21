import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getUser } from "../../../../../../utils";
import {
  favoriteFlagsForBooks,
  followFlagsForCreators,
} from "../../../../../../features/hyperview/findFlags";
import { getPublisherByBookId } from "../../../../../../features/dashboard/books/services";
import { bookIdSchema } from "../../../../../../schemas";
import { BookCardResult } from "../../../../../../constants/queries";
import FeedList from "../../../../../../features/hyperview/components/FeedList";
import { CREATOR_BOOKS_LOAD_MORE_ID } from "../../../../../../features/hyperview/components/CreatorPage";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const currentPage = parseInt(c.req.query("page") ?? "1", 10);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const loadMoreHref = `${baseUrl}/hyperview/books/${bookId}/tab/artist`;

  const [error, result] = await getPublisherByBookId(bookId);

  if (error || !result?.publisher) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <Text style="comments-placeholder">Publisher not found.</Text>
      </view>,
      404,
    );
  }

  const { publisher, books, totalPages = 1 } = result;
  const followingByCreatorId = await followFlagsForCreators(user, [publisher]);
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const hasMore = currentPage < totalPages;

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
    return hv(<view xmlns="https://hyperview.org/hyperview">{feedList}</view>);
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <CreatorCard
        creator={publisher}
        baseUrl={baseUrl}
        showHeader={false}
        isFollowing={followingByCreatorId[publisher.id] ?? false}
      />
      <Text style="artist-name">Books</Text>
      {books.length === 0 ? (
        <Text style="comments-placeholder">No books by this artist yet.</Text>
      ) : (
        feedList
      )}
    </view>,
  );
});
