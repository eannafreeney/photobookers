import { createRoute } from "hono-fsr";
import {
  filterPublishedBooks,
  getLatestBooks,
} from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard";
import { Items, Style, Text, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { favoriteFlagsForBooks } from "../../../features/hyperview/findFlags";
import BooksListItems, {
  BooksList,
  bookListItemsStyles,
} from "../../../features/hyperview/components/BookListItems";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen";
import BooksFilterForm, {
  BOOKS_LIST_TARGET_ID,
  BOOKS_SEARCH_BAR_ID,
  booksFilterFormStyles,
} from "../../../features/hyperview/components/BooksFilterForm";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { AuthUser } from "../../../../types";
import { BookCardResult } from "../../../constants/queries";

const PAGE_SIZE = 3;

const buildListProps = async (
  user: AuthUser | null,
  baseUrl: string,
  books: BookCardResult[],
  page: number,
  totalPages: number,
  filtering: boolean,
) => {
  const hasMore = !filtering && page < totalPages;
  const loadMorePath = `${baseUrl}/hyperview/books`;
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);

  return {
    books,
    baseUrl,
    favoritesByBookId,
    page,
    hasMore,
    loadMorePath,
    refreshHref: `${loadMorePath}?fragment=list`,
  };
};

const renderBooksListHost = (
  listProps: Awaited<ReturnType<typeof buildListProps>>,
  filtering: boolean,
) => (
  <View
    id={BOOKS_LIST_TARGET_ID}
    xmlns="https://hyperview.org/hyperview"
    style="books-list-panel"
  >
    {filtering && listProps.books.length === 0 ? (
      <View style="books-list-empty">
        <Text style="featured-empty-hint">No books found.</Text>
      </View>
    ) : (
      <BooksList {...listProps} />
    )}
  </View>
);

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const isListFragment = c.req.query("fragment") === "list";
  const currentPage = isListFragment ? 1 : parseInt(c.req.query("page") ?? "1");

  const [error, result] = await getLatestBooks(currentPage, PAGE_SIZE);

  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
    );
  }

  const books = result?.books ?? [];
  const totalPages = result?.totalPages ?? 1;
  const listProps = await buildListProps(
    user,
    baseUrl,
    books,
    currentPage,
    totalPages,
    false,
  );

  if (isListFragment) {
    return hv(
      <Items>
        <BooksListItems {...listProps} />
      </Items>,
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
      title="All Books"
      user={user}
      showDock
      dockActive="books"
      baseUrl={baseUrl}
      extraStyles={pageStyles()}
      nativeList
      isSearch
      searchToggleTarget={BOOKS_SEARCH_BAR_ID}
    >
      <View
        id={BOOKS_SEARCH_BAR_ID}
        style="books-search-bar"
        hide="true"
        sticky="true"
      >
        <BooksFilterForm baseUrl={baseUrl} />
      </View>
      {renderBooksListHost(listProps, false)}
    </AppLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const q = String((await c.req.formData()).get("q") ?? "").trim();
  const filtering = q.length > 0;

  const [error, result] = filtering
    ? await filterPublishedBooks(q, 50)
    : await getLatestBooks(1, PAGE_SIZE);

  if (error || !result) {
    return hv(
      <View
        id={BOOKS_LIST_TARGET_ID}
        xmlns="https://hyperview.org/hyperview"
        style="books-list-panel"
      >
        <Text style="featured-empty-hint">Could not filter books.</Text>
      </View>,
    );
  }

  const books = result.books ?? [];
  const listProps = await buildListProps(
    user,
    baseUrl,
    books,
    result.page ?? 1,
    result.totalPages ?? 1,
    filtering,
  );

  return hv(renderBooksListHost(listProps, filtering));
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    {booksFilterFormStyles()}
    {bookCardStyles()}
    {bookListItemsStyles()}
    <Style
      id="books-list-empty"
      paddingTop={24}
      paddingLeft={16}
      paddingRight={16}
    />
  </>
);
