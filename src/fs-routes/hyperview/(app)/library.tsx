import { createRoute } from "hono-fsr";
import {
  getBooksInCollection,
  getBooksInWishlist,
} from "../../../features/app/services";
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
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  if (!user) {
    return hv(
      <AppLayout
        title="Library"
        showBackButton={false}
        showDock
        baseUrl={baseUrl}
        dockActive="library"
        extraStyles={pageStyles()}
      >
        <View style="page-content">
          <Text style="featured-signin-hint">
            Sign in to view your wishlist and owned books.
          </Text>
        </View>
      </AppLayout>,
    );
  }

  const [[, wish], [, owned]] = await Promise.all([
    getBooksInWishlist(user.id, 1, "newest", 24),
    getBooksInCollection(user.id, 1, "newest", 24),
  ]);

  const wishBooks = wish?.books ?? [];
  const ownedBooks = owned?.books ?? [];
  const allForLikes = [...wishBooks, ...ownedBooks];
  const likesByBookId = await likeFlagsForBooks(user, allForLikes);

  return hv(
    <AppLayout
      title="Library"
      showBackButton={false}
      showDock
      baseUrl={baseUrl}
      dockActive="library"
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        {wishBooks.length === 0 && ownedBooks.length === 0 ? (
          <Text style="featured-empty-hint">
            Your wishlist and collection are empty.
          </Text>
        ) : (
          <>
            {wishBooks.length > 0 && (
              <>
                <Text style="library-section-title">Wishlist</Text>
                {wishBooks.map((book) => (
                  <BookCard
                    key={`w-${book.id}`}
                    book={book}
                    baseUrl={baseUrl}
                    user={user}
                    isLiked={likesByBookId[book.id] ?? false}
                  />
                ))}
              </>
            )}
            {ownedBooks.length > 0 && (
              <>
                <Text style="library-section-title">Owned</Text>
                {ownedBooks.map((book) => (
                  <BookCard
                    key={`o-${book.id}`}
                    book={book}
                    baseUrl={baseUrl}
                    user={user}
                    isLiked={likesByBookId[book.id] ?? false}
                  />
                ))}
              </>
            )}
          </>
        )}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="page-content" marginRight={16} marginLeft={16} paddingBottom={8} />
    <Style
      id="library-section-title"
      fontSize={16}
      fontWeight="700"
      color="#111111"
      marginTop={16}
      marginBottom={10}
    />
    {signInEmptyHintStyles()}
    {bookCardStyles()}
  </>
);
