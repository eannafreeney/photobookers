import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getBooksInWishlist } from "../../../features/app/services.js";
import { AppLayout } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard.js";
import { Items, Style, Text, View } from "../../../lib/hxml-comps.js";
import SignInPrompt, {
  signInPromptStyles
} from "../../../features/hyperview/components/SignInPrompt.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { getUser } from "../../../utils.js";
import { favoriteFlagsForBooks } from "../../../features/hyperview/findFlags.js";
import BooksListItems, {
  BooksList,
  bookListItemsStyles
} from "../../../features/hyperview/components/BookListItems.js";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles.js";
import ErrorScreen from "../../../features/hyperview/components/ErrorScreen.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const isListFragment = c.req.query("fragment") === "list";
  const currentPage = isListFragment ? 1 : parseInt(c.req.query("page") ?? "1");
  if (!user) {
    return hv(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Favorites",
          showDock: true,
          baseUrl,
          dockActive: "favorites",
          extraStyles: pageStyles(),
          dockScrollRefreshHref: `${baseUrl}/hyperview/favorites`,
          children: /* @__PURE__ */ jsx(View, { style: "favorites-empty", children: /* @__PURE__ */ jsx(
            SignInPrompt,
            {
              baseUrl,
              hint: "Sign in to see books on your wishlist."
            }
          ) })
        }
      )
    );
  }
  const [error, result] = await getBooksInWishlist(
    user.id,
    currentPage,
    "newest",
    3
  );
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: error.reason })
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
    refreshHref
  };
  if (isListFragment) {
    return hv(
      /* @__PURE__ */ jsx(Items, { children: /* @__PURE__ */ jsx(BooksListItems, { ...listProps }) })
    );
  }
  if (currentPage === 1 && books.length === 0) {
    return hv(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Favorites",
          user,
          showDock: true,
          baseUrl,
          dockActive: "favorites",
          extraStyles: pageStyles(),
          children: /* @__PURE__ */ jsx(View, { style: "favorites-empty", children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No favorites yet. Tap the heart on a book to add it to your wishlist." }) })
        }
      )
    );
  }
  if (currentPage > 1) {
    return hv(
      /* @__PURE__ */ jsx(Items, { children: /* @__PURE__ */ jsx(BooksListItems, { ...listProps }) })
    );
  }
  return hv(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Favorites",
        user,
        showDock: true,
        baseUrl,
        dockActive: "favorites",
        extraStyles: pageStyles(),
        nativeList: true,
        children: /* @__PURE__ */ jsx(BooksList, { ...listProps })
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  signInEmptyHintStyles(),
  signInPromptStyles(),
  /* @__PURE__ */ jsx(Style, { id: "favorites-empty", margin: 16, flexDirection: "column" }),
  bookCardStyles(),
  bookListItemsStyles()
] });
export {
  GET
};
