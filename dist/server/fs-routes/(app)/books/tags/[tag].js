import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator.js";
import { tagSchema } from "../../../../features/app/schema.js";
import { capitalize, getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import BooksGrid from "../../../../features/app/components/BooksGrid.js";
import BookFilters from "../../../../features/app/components/BookFilters.js";
import Intersector from "../../../../features/app/components/Intersector.js";
import { getFilteredBooks } from "../../../../features/app/services.js";
import InfoPage from "../../../../pages/InfoPage.js";
import PageHeader from "../../../../components/app/PageHeader.js";
import { BOOK_CATALOG_DEFAULT_SORT } from "../../../../lib/bookCatalogSort.js";
import { canonicalUrl, pageTitle, tagDescription } from "../../../../lib/seo.js";
import { booksFilterUrl, resolveBookCatalogSort, slugToTag } from "../../../../lib/tags.js";
const GET = createRoute(
  paramValidator(tagSchema),
  async (c) => {
    const tagSlug = c.req.valid("param").tag;
    const tag = slugToTag(tagSlug);
    const query = c.req.query("q") ?? null;
    const sort = resolveBookCatalogSort(
      c.req.query("sort"),
      BOOK_CATALOG_DEFAULT_SORT
    );
    const user = await getUser(c);
    const currentPage = Number(c.req.query("page") ?? 1);
    const currentPath = booksFilterUrl(`/books/tags/${tagSlug}`, {
      query,
      sort,
      defaultSort: BOOK_CATALOG_DEFAULT_SORT
    });
    const isFiltered = Boolean(query?.trim() && query.trim().length >= 3);
    const [error, result] = await getFilteredBooks({
      tag: tagSlug,
      query,
      page: currentPage,
      limit: 15,
      sort
    });
    if (error)
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
    const tagLabel = capitalize(tag);
    const title = pageTitle(`# ${tagLabel}`);
    const description = tagDescription(tagLabel);
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: canonicalUrl(c.req.url, `/books/tags/${tagSlug}`),
          user,
          currentPath,
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx(
              PageHeader,
              {
                kicker: "Browse by Theme",
                title: capitalize(tag),
                intro: `Photobooks tagged \u201C${capitalize(tag)}\u201D in the archive.`
              }
            ),
            /* @__PURE__ */ jsx(
              BookFilters,
              {
                activeTag: tagSlug,
                query,
                sort,
                defaultSort: BOOK_CATALOG_DEFAULT_SORT,
                collapsible: true
              }
            ),
            /* @__PURE__ */ jsx(
              BooksGrid,
              {
                isInfiniteScroll: true,
                user,
                currentPath,
                result,
                noResultsMessage: isFiltered ? "No books match your filters." : "No books found for this tag."
              }
            ),
            result.books.length > 0 && /* @__PURE__ */ jsx(
              Intersector,
              {
                id: "related-books-fragment",
                endpoint: `/fragments/related-books/${result.books[0].slug}`
              }
            )
          ] })
        }
      )
    );
  }
);
export {
  GET
};
