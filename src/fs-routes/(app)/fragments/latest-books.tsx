import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle";
import { BOOKS_CATALOG_TARGET_ID } from "../../../features/app/components/BookFilters";
import BooksGridWithFilters from "../../../features/app/components/BookGridWithFilters";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import { getFilteredBooks } from "../../../features/app/services";
import { booksFilterUrl, resolveBookCatalogSort } from "../../../lib/tags";
import { getUser } from "../../../utils";

const FEATURED_BOOKS_LIMIT = 10;
const FRAGMENT_PATH = "/fragments/latest-books";
const DEFAULT_SORT = "trending" as const;

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const tag = c.req.query("tag") ?? null;
  const query = c.req.query("q") ?? null;
  const sort = resolveBookCatalogSort(c.req.query("sort"), DEFAULT_SORT);
  const isFiltered = Boolean(tag?.trim() || (query?.trim()?.length ?? 0) >= 3);
  const viewAllHref = booksFilterUrl("/books", {
    tag,
    query,
    sort,
    defaultSort: DEFAULT_SORT,
  });

  const [error, result] = await getFilteredBooks({
    tag,
    query,
    page: 1,
    limit: FEATURED_BOOKS_LIMIT,
    sort,
  });

  if (error || !result) return c.html(<></>);

  const hasMore = result.totalPages > 1;
  const gridProps = {
    user,
    tag,
    query,
    sort,
    defaultSort: DEFAULT_SORT,
    currentPath: viewAllHref,
    result,
    isFiltered,
    isInfiniteScroll: false,
    ajaxPath: FRAGMENT_PATH,
    historyPath: null,
    hasMore,
    viewAllHref,
  };

  if (c.req.query("fragment") === "grid") {
    return c.html(
      <div id={BOOKS_CATALOG_TARGET_ID} x-merge="replace">
        <BooksGridWithFilters {...gridProps} />
      </div>,
    );
  }

  return c.html(
    <div id="latest-books-fragment">
      <div class="flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3">
        <SectionTitle className="mb-0" kicker="New Arrivals">
          Latest Books
        </SectionTitle>
        <ViewAllLink href="/books" />
      </div>
      <div id={BOOKS_CATALOG_TARGET_ID}>
        <BooksGridWithFilters {...gridProps} />
      </div>
    </div>,
  );
});
