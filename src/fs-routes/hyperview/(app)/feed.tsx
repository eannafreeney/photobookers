import { createRoute } from "hono-fsr";
import { getFeedBooks } from "../../../features/app/services";
import BookCard, {
  bookCardStyles,
} from "../../../features/hyperview/components/BookCard";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { Style, Text, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { likeFlagsForBooks } from "../../../features/hyperview/likeFlags";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);

  if (!user) {
    return hv(
      <AppLayout
        title="Feed"
        showBackButton={false}
        showDock
        baseUrl={baseUrl}
        dockActive="feed"
        extraStyles={pageStyles()}
      >
        <View style="page-content">
          <Text style="featured-signin-hint">
            Sign in to see updates from creators you follow.
          </Text>
        </View>
      </AppLayout>,
    );
  }

  const [, feedResult] = await getFeedBooks(user.id, 1, "newest", 30);
  const books = feedResult?.books ?? [];
  const likesByBookId = await likeFlagsForBooks(user, books);

  return hv(
    <AppLayout
      title="Feed"
      showBackButton={false}
      showDock
      baseUrl={baseUrl}
      dockActive="feed"
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        {books.length === 0 ? (
          <Text style="featured-empty-hint">
            Follow artists or publishers to see their new books here.
          </Text>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              baseUrl={baseUrl}
              user={user}
              isLiked={likesByBookId[book.id] ?? false}
            />
          ))
        )}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style
      id="page-content"
      marginRight={16}
      marginLeft={16}
      paddingBottom={8}
    />
    {signInEmptyHintStyles()}
    {bookCardStyles()}
  </>
);
