import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import NavSearchResults from "../../../components/app/NavSearchResults.js";
import PageHeader from "../../../components/app/PageHeader.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import { searchBooks } from "../../../features/api/services.js";
import { searchFairsForNav } from "../../../features/app/fairs/services.js";
import { searchCreators } from "../../../features/app/services.js";
import { canonicalUrl, pageTitle } from "../../../lib/seo.js";
import { getUser } from "../../../utils.js";
const FULL_RESULTS_LIMIT = 50;
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search")?.trim() ?? "";
  const currentPath = searchQuery ? `/search/results?search=${encodeURIComponent(searchQuery)}` : "/search/results";
  const title = pageTitle(
    searchQuery ? `Search results for "${searchQuery}"` : "Search"
  );
  const description = searchQuery ? `Search photobookers for creators, books, and fairs matching "${searchQuery}".` : "Search photobookers for creators, books, and fairs.";
  if (searchQuery.length < 3) {
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: canonicalUrl(c.req.url, currentPath),
          user,
          currentPath,
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
            /* @__PURE__ */ jsx(
              PageHeader,
              {
                kicker: "Search",
                title: "Search results",
                intro: "Enter at least 3 characters to search across creators, books, and fairs."
              }
            ),
            /* @__PURE__ */ jsx(SearchResultsForm, { searchQuery })
          ] }) })
        }
      )
    );
  }
  const [[bookError, books], [creatorError, creators], [fairError, fairs]] = await Promise.all([
    searchBooks(searchQuery.toLowerCase(), FULL_RESULTS_LIMIT),
    searchCreators(searchQuery.toLowerCase(), FULL_RESULTS_LIMIT),
    searchFairsForNav(searchQuery.toLowerCase(), FULL_RESULTS_LIMIT)
  ]);
  if (bookError || creatorError || fairError) {
    return c.html(/* @__PURE__ */ jsx(Fragment, {}));
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, currentPath),
        user,
        currentPath,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "Search",
              title: /* @__PURE__ */ jsxs(Fragment, { children: [
                "Results for ",
                /* @__PURE__ */ jsxs("span", { class: "text-accent", children: [
                  '"',
                  searchQuery,
                  '"'
                ] })
              ] }),
              intro: "Explore matching creators, books, and fairs from across photobookers."
            }
          ),
          /* @__PURE__ */ jsx(SearchResultsForm, { searchQuery }),
          /* @__PURE__ */ jsx(
            NavSearchResults,
            {
              creators: creators ?? [],
              books: books ?? [],
              fairs: fairs ?? [],
              searchQuery,
              variant: "page"
            }
          )
        ] }) })
      }
    )
  );
});
const SearchResultsForm = ({ searchQuery }) => /* @__PURE__ */ jsx("form", { action: "/search/results", method: "get", class: "w-full", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3 sm:flex-row", children: [
  /* @__PURE__ */ jsx(
    "input",
    {
      type: "text",
      name: "search",
      value: searchQuery,
      placeholder: "Search creators, books, and fairs",
      class: "w-full rounded-radius border border-outline bg-surface px-4 py-3 text-base text-on-surface focus:outline-none"
    }
  ),
  /* @__PURE__ */ jsx(
    "button",
    {
      type: "submit",
      class: "whitespace-nowrap rounded-radius bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-primary transition hover:opacity-75",
      children: "Search"
    }
  )
] }) });
export {
  GET
};
