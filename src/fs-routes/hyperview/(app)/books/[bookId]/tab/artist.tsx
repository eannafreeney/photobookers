import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Text } from "../../../../../../lib/hxml-comps";
import type { BookCardResult } from "../../../../../../constants/queries";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { CREATOR_BOOKS_LOAD_MORE_ID } from "../../../../../../features/hyperview/components/CreatorPage";
import FeedList, {
  feedListStyles,
} from "../../../../../../features/hyperview/components/FeedList";
import { bookIdSchema } from "../../../../../../schemas";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getUser } from "../../../../../../utils";
import {
  favoriteFlagsForBooks,
  followFlagsForCreators,
} from "../../../../../../features/hyperview/findFlags";
import { getArtistByBookId } from "../../../../../../features/dashboard/books/services";

export const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const currentPage = parseInt(c.req.query("page") ?? "1", 10);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const loadMoreHref = `${baseUrl}/hyperview/books/${bookId}/tab/artist`;

  const [error, result] = await getArtistByBookId(bookId, currentPage);

  if (error || !result?.artist) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }

  const { artist, books, totalPages = 1 } = result;
  const followingByCreatorId = await followFlagsForCreators(user, [artist]);
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
      currentCreatorId={artist.id}
    />
  );

  if (currentPage > 1) {
    return hv(<view xmlns="https://hyperview.org/hyperview">{feedList}</view>);
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <CreatorCard
        creator={artist}
        baseUrl={baseUrl}
        showHeader={false}
        isFollowing={followingByCreatorId[artist.id] ?? false}
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

export const artistTabStyles = () => feedListStyles();
