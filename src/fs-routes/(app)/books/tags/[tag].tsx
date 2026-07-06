import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator";
import { tagSchema } from "../../../../features/app/schema";
import { capitalize, getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import BooksGrid from "../../../../features/app/components/BooksGrid";
import BookFilters from "../../../../features/app/components/BookFilters";
import Intersector from "../../../../features/app/components/Intersector";
import { getFilteredBooks } from "../../../../features/app/services";
import InfoPage from "../../../../pages/InfoPage";
import { BookTagContext } from "../../../../features/app/types";
import PageHeader from "../../../../components/app/PageHeader";
import { BOOK_CATALOG_DEFAULT_SORT } from "../../../../lib/bookCatalogSort";
import { canonicalUrl, pageTitle, tagDescription } from "../../../../lib/seo";
import { booksFilterUrl, resolveBookCatalogSort, slugToTag } from "../../../../lib/tags";

export const GET = createRoute(
  paramValidator(tagSchema),
  async (c: BookTagContext) => {
    const tagSlug = c.req.valid("param").tag;
    const tag = slugToTag(tagSlug);
    const query = c.req.query("q") ?? null;
    const user = await getUser(c);
    const currentPage = Number(c.req.query("page") ?? 1);
    const currentPath = booksFilterUrl("/books", { tag: tagSlug, query });
    const isFiltered = Boolean(query?.trim() && query.trim().length >= 3);

    const [error, result] = await getFilteredBooks({
      tag: tagSlug,
      query,
      page: currentPage,
      limit: 15,
    });
    if (error)
      return c.html(<InfoPage errorMessage={error.reason} user={user} />);

    const tagLabel = capitalize(tag);
    const title = pageTitle(`# ${tagLabel}`);
    const description = tagDescription(tagLabel);

    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={canonicalUrl(c.req.url, `/books/tags/${tagSlug}`)}
        user={user}
        currentPath={currentPath}
      >
        <Page>
          <PageHeader
            kicker="Browse by Theme"
            title={capitalize(tag)}
            intro={`Photobooks tagged “${capitalize(tag)}” in the archive.`}
          />
          <BookFilters activeTag={tagSlug} query={query} collapsible />
          <BooksGrid
            isInfiniteScroll
            user={user}
            currentPath={currentPath}
            result={result}
            noResultsMessage={
              isFiltered
                ? "No books match your filters."
                : "No books found for this tag."
            }
          />
          {result.books.length > 0 && (
            <Intersector
              id="related-books-fragment"
              endpoint={`/fragments/related-books/${result.books[0].slug}`}
            />
          )}
        </Page>
      </AppLayout>,
    );
  },
);
