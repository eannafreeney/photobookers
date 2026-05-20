import { createRoute } from "hono-fsr";
import { getFeedBooks } from "../../../../../features/app/services";
import BookCard from "../../../../../features/hyperview/components/BookCard";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { Text } from "../../../../../lib/hxml-comps";
import { getUser } from "../../../../../utils";
import { wishlistFlagsForBooks } from "../../../../../features/hyperview/findFlags";
import BooksUpdatedListener from "../../../../../features/hyperview/components/BooksUpdatedListener";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");

  if (!user) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="featured-empty-hint">
          This is your books feed, where we'll show you new releases from the
          artists and publishers you follow.
        </Text>
      </view>,
    );
  }

  const [, feedResult] = await getFeedBooks(user.id, currentPage, "newest", 10);
  const books = feedResult?.books ?? [];

  if (books.length === 0) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="featured-empty-hint">
          Follow artists or publishers to see their new books here.
        </Text>
      </view>,
    );
  }

  const baseUrl = getBaseUrl(c);
  const wishlistsByBookId = await wishlistFlagsForBooks(user, books);

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <BooksUpdatedListener
        refreshHref={`${baseUrl}/hyperview/featured/tab/feed?page=${currentPage}`}
      />
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          baseUrl={baseUrl}
          isWishlisted={wishlistsByBookId[book.id] ?? false}
        />
      ))}
    </view>,
  );
});
