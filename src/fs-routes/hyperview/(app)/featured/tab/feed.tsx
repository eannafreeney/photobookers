import { createRoute } from "hono-fsr";
import { getFeedBooks } from "../../../../../features/app/services";
import FeedList from "../../../../../features/hyperview/components/FeedList";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { Text } from "../../../../../lib/hxml-comps";
import { getUser } from "../../../../../utils";
import SignInPrompt from "../../../../../features/hyperview/components/SignInPrompt";
import { favoriteFlagsForBooks } from "../../../../../features/hyperview/findFlags";
import BooksUpdatedListener from "../../../../../features/hyperview/components/BooksUpdatedListener";
import ErrorScreen from "../../../../../features/hyperview/components/ErrorScreen";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const loadMoreHref = `${baseUrl}/hyperview/featured/tab/feed`;

  if (!user) {
    return hv(
      <SignInPrompt
        variant="fragment"
        baseUrl={baseUrl}
        hint="Sign in to see new releases from artists and publishers you follow."
      />,
    );
  }

  const [error, feedResult] = await getFeedBooks(
    user.id,
    currentPage,
    "newest",
    3,
  );

  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
    );
  }

  const books = feedResult?.books ?? [];
  const totalPages = feedResult?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;

  if (currentPage === 1 && books.length === 0) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="featured-empty-hint">
          Follow artists or publishers to see their new books here.
        </Text>
      </view>,
    );
  }

  const favoritesByBookId = await favoriteFlagsForBooks(user, books);

  const list = (
    <>
      {currentPage === 1 ? (
        <BooksUpdatedListener
          refreshHref={`${baseUrl}/hyperview/featured/tab/feed`}
        />
      ) : null}
      <FeedList
        books={books}
        baseUrl={baseUrl}
        favoritesByBookId={favoritesByBookId}
        page={currentPage}
        hasMore={hasMore}
        loadMoreHref={loadMoreHref}
      />
    </>
  );

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      {list}
    </view>,
  );
});
