import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { searchCreators } from "../../features/app/services.js";
import { searchBooks } from "../../features/api/services.js";
import { searchFairsForNav } from "../../features/app/fairs/services.js";
import Link from "../../components/app/Link.js";
import { capitalize, getUser } from "../../utils.js";
import { DISCOVER_TAGS } from "../../constants/discover.js";
import { tagBooksUrl } from "../../lib/tags.js";
import Pill from "../../components/app/Pill.js";
import NavSearchResults from "../../components/app/NavSearchResults.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const isMobile = c.req.query("isMobile") === "true";
  if (!searchQuery || searchQuery.length < 3) {
    return c.html(
      /* @__PURE__ */ jsx(
        "div",
        {
          id: isMobile ? "search-results-mobile" : "search-results",
          class: "fixed inset-0 z-50 h-screen w-screen md:absolute md:inset-auto top-18 md:top-11  md:h-auto md:w-fit md:min-w-64 lg:min-w-96 overflow-hidden border shadow-lg border-outline bg-surface ",
          "x-data": "{ isOpen: true }",
          "x-show": "isOpen",
          children: /* @__PURE__ */ jsx("div", { class: "flex flex-wrap items-center justify-center gap-6 p-4", children: DISCOVER_TAGS.map((tag) => /* @__PURE__ */ jsx(Link, { href: tagBooksUrl(tag), children: /* @__PURE__ */ jsx(Pill, { variant: "default", children: capitalize(tag) }, tag) }, tag)) })
        }
      )
    );
  }
  const searchTerm = searchQuery?.trim().toLowerCase();
  const [[bookError, books], [creatorError, creators], [fairError, fairs]] = await Promise.all([
    searchBooks(searchTerm ?? ""),
    searchCreators(searchTerm ?? ""),
    searchFairsForNav(searchTerm ?? "")
  ]);
  if (bookError || creatorError || fairError) {
    return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  }
  return c.html(
    /* @__PURE__ */ jsx(
      NavSearchResults,
      {
        isMobile,
        creators: creators ?? [],
        books: books ?? [],
        fairs: fairs ?? [],
        searchQuery
      }
    )
  );
});
export {
  GET
};
