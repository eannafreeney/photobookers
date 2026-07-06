import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFeedBooks } from "../../../../../features/app/services.js";
import FeedList from "../../../../../features/hyperview/components/FeedList.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import { Text } from "../../../../../lib/hxml-comps.js";
import { getUser } from "../../../../../utils.js";
import SignInPrompt from "../../../../../features/hyperview/components/SignInPrompt.js";
import { favoriteFlagsForBooks } from "../../../../../features/hyperview/findFlags.js";
import BooksUpdatedListener from "../../../../../features/hyperview/components/BooksUpdatedListener.js";
import ErrorScreen from "../../../../../features/hyperview/components/ErrorScreen.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const loadMoreHref = `${baseUrl}/hyperview/featured/tab/feed`;
  if (!user) {
    return hv(
      /* @__PURE__ */ jsx(
        SignInPrompt,
        {
          variant: "fragment",
          baseUrl,
          hint: "Sign in to see new releases from artists and publishers you follow."
        }
      )
    );
  }
  const [error, feedResult] = await getFeedBooks(
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
  const books = feedResult?.books ?? [];
  const totalPages = feedResult?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;
  if (currentPage === 1 && books.length === 0) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "Follow artists or publishers to see their new books here." }) })
    );
  }
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const list = /* @__PURE__ */ jsxs(Fragment, { children: [
    currentPage === 1 ? /* @__PURE__ */ jsx(
      BooksUpdatedListener,
      {
        refreshHref: `${baseUrl}/hyperview/featured/tab/feed`
      }
    ) : null,
    /* @__PURE__ */ jsx(
      FeedList,
      {
        books,
        baseUrl,
        favoritesByBookId,
        page: currentPage,
        hasMore,
        loadMoreHref
      }
    )
  ] });
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: list })
  );
});
export {
  GET
};
