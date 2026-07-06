import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Spinner, Style } from "../../../lib/hxml-comps.js";
import BookCard from "./BookCard.js";
const FEATURED_FEED_LOAD_MORE_ID = "featured-feed-load-more";
const FeedList = ({
  books,
  baseUrl,
  favoritesByBookId,
  page = 1,
  hasMore = false,
  loadMoreHref,
  loadMoreId = FEATURED_FEED_LOAD_MORE_ID,
  currentCreatorId
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  books.map((book) => /* @__PURE__ */ jsx(
    BookCard,
    {
      book,
      baseUrl,
      currentCreatorId,
      isFavorited: favoritesByBookId[book.id] ?? false
    },
    book.id
  )),
  hasMore && loadMoreHref ? /* @__PURE__ */ jsx(
    "view",
    {
      id: loadMoreId,
      style: "featured-tab-spinner",
      trigger: "visible",
      once: "true",
      verb: "get",
      href: `${loadMoreHref}${loadMoreHref.includes("?") ? "&" : "?"}page=${page + 1}`,
      action: "replace",
      children: /* @__PURE__ */ jsx(Spinner, {})
    }
  ) : null
] });
var FeedList_default = FeedList;
const feedListStyles = () => /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
  Style,
  {
    id: "featured-tab-spinner",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 16
  }
) });
export {
  FEATURED_FEED_LOAD_MORE_ID,
  FeedList_default as default,
  feedListStyles
};
