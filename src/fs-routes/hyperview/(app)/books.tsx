import { createRoute } from "hono-fsr";
import { getFilteredBooks } from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard";
import { Items, Text, View, Item } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { favoriteFlagsForBooks } from "../../../features/hyperview/findFlags";
import BooksListItems, {
  BooksList,
  bookListItemsStyles,
} from "../../../features/hyperview/components/BookListItems";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen";
import BookFilters, {
  BOOKS_CATALOG_TARGET_ID,
  BOOKS_LIST_TARGET_ID,
  bookFiltersStyles,
} from "../../../features/hyperview/components/BookFiltersPanel";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { hyperviewBooksFilterUrl, resolveBookCatalogSort } from "../../../lib/tags";
import { AuthUser } from "../../../../types";
import { BookCardResult } from "../../../constants/queries";
import BookFiltersPanel from "../../../features/hyperview/components/BookFiltersPanel";
import type { BookCatalogSort } from "../../../lib/bookCatalogSort";

const PAGE_SIZE = 3;
const DEFAULT_SORT = "newest" as const;

type FilterQuery = {
  tag?: string | null;
  q?: string | null;
  sort?: BookCatalogSort;
};

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const tag = c.req.query("tag") ?? null;
  const q = c.req.query("q") ?? null;
  const sort = resolveBookCatalogSort(c.req.query("sort"), DEFAULT_SORT);
  const isListFragment = c.req.query("fragment") === "list";
  const isCatalogFragment = c.req.query("fragment") === "catalog";
  const currentPage = isListFragment ? 1 : parseInt(c.req.query("page") ?? "1");
  const isFiltered = Boolean(tag?.trim() || (q?.trim()?.length ?? 0) >= 3);

  const [error, result] = await getFilteredBooks({
    tag,
    query: q,
    page: currentPage,
    limit: PAGE_SIZE,
    sort,
  });

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
    { tag, q, sort },
  );

  if (isCatalogFragment) {
    return hv(
      renderBooksCatalog(baseUrl, tag, q, sort, listProps, isFiltered),
    );
  }

  if (isListFragment) {
    return hv(
      <Items>
        <Item
          itemKey="book-filters-header"
          style="books-list-filters-header"
          sticky="true"
        >
          <BookFiltersPanel
            baseUrl={baseUrl}
            activeTag={tag}
            q={q}
            sort={sort}
            defaultSort={DEFAULT_SORT}
          />
        </Item>
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
      showDock
      nativeList
      title="All Books"
      user={user}
      dockActive="books"
      baseUrl={baseUrl}
      extraStyles={pageStyles()}
      dockScrollRefreshHref={hyperviewBooksFilterUrl(baseUrl, {
        tag,
        query: q,
        sort,
        defaultSort: DEFAULT_SORT,
      })}
    >
      {renderBooksCatalog(baseUrl, tag, q, sort, listProps, isFiltered)}
    </AppLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const formData = await c.req.formData();
  const q = String(formData.get("q") ?? "").trim();
  const tagFromRequest =
    (c.req.query("tag") ?? String(formData.get("tag") ?? "").trim()) || null;
  const tag = q.length >= 3 ? tagFromRequest : null;
  const sort = resolveBookCatalogSort(c.req.query("sort"), DEFAULT_SORT);
  const isFiltered = Boolean(tag || q.length >= 3);

  const [error, result] = await getFilteredBooks({
    tag,
    query: q,
    page: 1,
    limit: PAGE_SIZE,
    sort,
  });

  if (error || !result) {
    return hv(
      <View
        id={BOOKS_CATALOG_TARGET_ID}
        style="books-catalog-shell"
        xmlns="https://hyperview.org/hyperview"
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
    { tag, q, sort },
  );

  return hv(renderBooksCatalog(baseUrl, tag, q, sort, listProps, isFiltered));
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    {bookFiltersStyles()}
    {bookCardStyles()}
    {bookListItemsStyles()}
  </>
);

const buildListProps = async (
  user: AuthUser | null,
  baseUrl: string,
  books: BookCardResult[],
  page: number,
  totalPages: number,
  filters: FilterQuery,
) => {
  const loadMorePath = hyperviewBooksFilterUrl(baseUrl, {
    tag: filters.tag,
    query: filters.q,
    sort: filters.sort,
    defaultSort: DEFAULT_SORT,
  });
  const hasMore = page < totalPages;
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const refreshHref = `${loadMorePath}${loadMorePath.includes("?") ? "&" : "?"}fragment=list`;

  return {
    books,
    baseUrl,
    favoritesByBookId,
    page,
    hasMore,
    loadMorePath,
    refreshHref,
  };
};

const renderBooksListHost = (
  baseUrl: string,
  tag: string | null,
  q: string | null,
  sort: BookCatalogSort,
  listProps: Awaited<ReturnType<typeof buildListProps>>,
  isFiltered: boolean,
) => {
  return (
    <View
      id={BOOKS_LIST_TARGET_ID}
      xmlns="https://hyperview.org/hyperview"
      style="books-list-panel"
    >
      <BooksList
        {...listProps}
        emptyMessage={
          isFiltered && listProps.books.length === 0
            ? "No books match your filters."
            : undefined
        }
      >
        <BookFiltersPanel
          baseUrl={baseUrl}
          activeTag={tag}
          q={q}
          sort={sort}
          defaultSort={DEFAULT_SORT}
        />
      </BooksList>
    </View>
  );
};

const renderBooksCatalog = (
  baseUrl: string,
  tag: string | null,
  q: string | null,
  sort: BookCatalogSort,
  listProps: Awaited<ReturnType<typeof buildListProps>>,
  isFiltered: boolean,
) => (
  <View
    id={BOOKS_CATALOG_TARGET_ID}
    style="books-catalog-shell"
    xmlns="https://hyperview.org/hyperview"
  >
    {renderBooksListHost(baseUrl, tag, q, sort, listProps, isFiltered)}
  </View>
);
