import { createRoute } from "hono-fsr";
import { getBooksInWishlist } from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard";
import { Items, Style, Text, View } from "../../../lib/hxml-comps";
import SignInPrompt, {
  signInPromptStyles,
} from "../../../features/hyperview/components/SignInPrompt";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { favoriteFlagsForBooks } from "../../../features/hyperview/findFlags";
import BooksListItems, {
  BooksList,
  bookListItemsStyles,
} from "../../../features/hyperview/components/BookListItems";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const isListFragment = c.req.query("fragment") === "list";
  const currentPage = isListFragment ? 1 : parseInt(c.req.query("page") ?? "1");

  if (!user) {
    return hv(
      <AppLayout
        title="Favorites"
        showDock
        baseUrl={baseUrl}
        dockActive="favorites"
        extraStyles={pageStyles()}
        dockScrollRefreshHref={`${baseUrl}/hyperview/favorites`}
      >
        <View style="favorites-empty">
          <SignInPrompt
            baseUrl={baseUrl}
            hint="Sign in to see your favourites."
          />
        </View>
      </AppLayout>,
    );
  }

  const [error, result] = await getBooksInWishlist(
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

  const books = result?.books ?? [];
  const totalPages = result?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const loadMorePath = `${baseUrl}/hyperview/favorites`;
  const refreshHref = `${loadMorePath}?fragment=list`;
  const listProps = {
    books,
    baseUrl,
    favoritesByBookId,
    page: currentPage,
    hasMore,
    loadMorePath,
    refreshHref,
  };

  if (isListFragment) {
    return hv(
      <Items>
        <BooksListItems {...listProps} />
      </Items>,
    );
  }

  if (currentPage === 1 && books.length === 0) {
    return hv(
      <AppLayout
        title="Favorites"
        user={user}
        showDock
        baseUrl={baseUrl}
        dockActive="favorites"
        extraStyles={pageStyles()}
      >
        <View style="favorites-empty">
          <Text style="featured-empty-hint">
            No favourites yet. Tap the heart on a book to add it to your
            favourites.
          </Text>
        </View>
      </AppLayout>,
    );
  }

  if (currentPage > 1) {
    return hv(
      <Items>
        <BooksListItems {...listProps} />
      </Items>,
    );
  }

  return hv(
    <AppLayout
      title="Favorites"
      user={user}
      showDock
      baseUrl={baseUrl}
      dockActive="favorites"
      extraStyles={pageStyles()}
      nativeList
    >
      <BooksList {...listProps} />
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    {signInPromptStyles()}
    <Style id="favorites-empty" margin={16} flexDirection="column" />
    {bookCardStyles()}
    {bookListItemsStyles()}
  </>
);
