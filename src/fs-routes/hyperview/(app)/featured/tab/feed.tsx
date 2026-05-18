import { createRoute } from "hono-fsr";
import { getFeedBooks } from "../../../../../features/app/services";
import BookCard from "../../../../../features/hyperview/components/BookCard";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { Text } from "../../../../../lib/hxml-comps";
import { getUser } from "../../../../../utils";
import { likeFlagsForBooks } from "../../../../../features/hyperview/likeFlags";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const user = await getUser(c);

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

  const [, feedResult] = await getFeedBooks(user.id, 1, "newest", 30);
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
  const likesByBookId = await likeFlagsForBooks(user, books);

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          baseUrl={baseUrl}
          user={user}
          isLiked={likesByBookId[book.id] ?? false}
        />
      ))}
    </view>,
  );
});
