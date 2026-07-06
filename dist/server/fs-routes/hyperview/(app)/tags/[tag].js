import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getBaseUrl } from "../../../../lib/hyperview.js";
import { paramValidator } from "../../../../lib/validator.js";
import { getFilteredBooks } from "../../../../features/app/services.js";
import { tagSchema } from "../../../../features/app/schema.js";
import { hyperview } from "../../../../lib/hxml.js";
import { capitalize, getUser } from "../../../../utils.js";
import { favoriteFlagsForBooks } from "../../../../features/hyperview/findFlags.js";
import { AppLayout } from "../../+layout.js";
import { bookCardStyles } from "../../../../features/hyperview/components/BookCard.js";
import FeedList, {
  feedListStyles
} from "../../../../features/hyperview/components/FeedList.js";
import { signInEmptyHintStyles } from "../../../../features/hyperview/hyperviewCommonScreenStyles.js";
import { Text, View } from "../../../../lib/hxml-comps.js";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen.js";
import { BOOK_CATALOG_DEFAULT_SORT } from "../../../../lib/bookCatalogSort.js";
import { resolveBookCatalogSort } from "../../../../lib/tags.js";
const TAG_BOOKS_LOAD_MORE_ID = "tag-books-load-more";
const TAG_PAGE_SIZE = 12;
const GET = createRoute(paramValidator(tagSchema), async (c) => {
  const tag = c.req.valid("param").tag;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    BOOK_CATALOG_DEFAULT_SORT
  );
  const loadMoreParams = new URLSearchParams();
  if (sort !== BOOK_CATALOG_DEFAULT_SORT) loadMoreParams.set("sort", sort);
  const loadMoreQuery = loadMoreParams.toString();
  const loadMoreHref = `${baseUrl}/hyperview/tags/${encodeURIComponent(tag)}${loadMoreQuery ? `?${loadMoreQuery}` : ""}`;
  const [error, result] = await getFilteredBooks({
    tag,
    page: currentPage,
    limit: TAG_PAGE_SIZE,
    sort
  });
  const hv = hyperview(c);
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason })
    );
  }
  const { books, totalPages = 1 } = result;
  const hasMore = currentPage < totalPages;
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const pageTitle = `# ${capitalize(tag)}`;
  if (currentPage === 1 && books.length === 0) {
    return hv(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: pageTitle,
          extraStyles: pageStyles(),
          showDock: true,
          baseUrl,
          dockScrollRefreshHref: loadMoreHref,
          children: /* @__PURE__ */ jsx(View, { id: "page-content", style: "page-content", children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No books found for this tag." }) })
        }
      )
    );
  }
  const list = /* @__PURE__ */ jsx(
    FeedList,
    {
      books,
      baseUrl,
      favoritesByBookId,
      page: currentPage,
      hasMore,
      loadMoreHref,
      loadMoreId: TAG_BOOKS_LOAD_MORE_ID
    }
  );
  if (currentPage > 1) {
    return hv(/* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: list }));
  }
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: pageTitle,
        extraStyles: pageStyles(),
        showDock: true,
        baseUrl,
        children: /* @__PURE__ */ jsx(View, { id: "page-content", style: "page-content", children: list })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  signInEmptyHintStyles(),
  bookCardStyles(),
  feedListStyles()
] });
export {
  GET,
  TAG_BOOKS_LOAD_MORE_ID
};
