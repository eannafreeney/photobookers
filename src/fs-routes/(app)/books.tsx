import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import Page from "../../components/layouts/Page";
import { BOOKS_CATALOG_TARGET_ID } from "../../features/app/components/BookFilters";
import AppLayout from "../../components/layouts/AppLayout";
import { getFilteredBooks } from "../../features/app/services";
import PageHeader from "../../components/app/PageHeader";
import { canonicalUrl, pageTitle } from "../../lib/seo";
import { BOOK_CATALOG_DEFAULT_SORT } from "../../lib/bookCatalogSort";
import { booksFilterUrl, resolveBookCatalogSort } from "../../lib/tags";
import BooksGridWithFilters from "../../features/app/components/BookGridWithFilters";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const tag = c.req.query("tag") ?? null;
  const query = c.req.query("q") ?? null;
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    BOOK_CATALOG_DEFAULT_SORT,
  );
  const currentPage = Number(c.req.query("page") ?? 1);
  const currentPath = booksFilterUrl("/books", {
    tag,
    query,
    sort,
    defaultSort: BOOK_CATALOG_DEFAULT_SORT,
  });
  const isFiltered = Boolean(tag?.trim() || (query?.trim()?.length ?? 0) >= 3);

  const [error, result] = await getFilteredBooks({
    tag,
    query,
    page: currentPage,
    limit: 30,
    sort,
  });

  if (error || !result) return c.html(<></>);

  if (c.req.query("fragment") === "grid") {
    return c.html(
      <div id={BOOKS_CATALOG_TARGET_ID} x-merge="replace">
        <BooksGridWithFilters
          user={user}
          tag={tag}
          query={query}
          sort={sort}
          defaultSort={DEFAULT_SORT}
          currentPath={currentPath}
          result={result}
          isFiltered={isFiltered}
        />
      </div>,
    );
  }

  const title = pageTitle("All Books");
  const description =
    "Browse the full photobookers catalogue. Discover photobooks from artists and publishers around the world.";

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, currentPath)}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          kicker="The Catalogue"
          title="All Books"
          intro="Every photobook in the archive. Artists and publishers from around the world."
        />
        <div id={BOOKS_CATALOG_TARGET_ID}>
          <BooksGridWithFilters
            user={user}
            tag={tag}
            query={query}
            sort={sort}
            defaultSort={DEFAULT_SORT}
            currentPath={currentPath}
            result={result}
            isFiltered={isFiltered}
          />
        </div>
      </Page>
    </AppLayout>,
  );
});
