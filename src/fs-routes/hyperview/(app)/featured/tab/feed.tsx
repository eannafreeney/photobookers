import { createRoute } from "hono-fsr";
import { getFeedBooks } from "../../../../../features/app/services";
import BookCard from "../../../../../features/hyperview/components/BookCard";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { Text } from "../../../../../lib/hxml-comps";
import { getUser } from "../../../../../utils";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const user = await getUser(c);

  if (!user) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="featured-signin-hint">
          Sign in to see updates from creators you follow.
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

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      {books.map((book) => (
        <BookCard key={book.id} book={book} baseUrl={baseUrl} />
      ))}
    </view>,
  );
});
