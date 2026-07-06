import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { searchCreators } from "../../../features/app/services.js";
import { AppLayout } from "../+layout.js";
import { hyperview } from "../../../lib/hxml.js";
import { Text, View } from "../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { searchBooks } from "../../../features/api/services.js";
import HVSearchResults, {
  hvSearchResultsStyles
} from "../../../features/hyperview/components/SearchResults.js";
import DiscoveryTags, {
  discoveryTagStyles
} from "../../../features/hyperview/components/DiscoveryTags.js";
import SearchForm, {
  searchFormStyles
} from "../../../features/hyperview/components/SearchForm.js";
import { DISCOVER_TAGS } from "../../../constants/discover.js";
const SEARCH_RESULTS_TARGET_ID = "search-results-host";
const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  return hv(
    /* @__PURE__ */ jsx(AppLayout, { title: "Search", baseUrl, extraStyles: pageStyles(), children: /* @__PURE__ */ jsxs(View, { style: "page-content", children: [
      /* @__PURE__ */ jsx(View, { style: "search-section", children: /* @__PURE__ */ jsx(SearchForm, { baseUrl }) }),
      /* @__PURE__ */ jsx(
        View,
        {
          id: SEARCH_RESULTS_TARGET_ID,
          xmlns: "https://hyperview.org/hyperview",
          style: "search-results-stack",
          children: /* @__PURE__ */ jsx(DiscoveryTags, { baseUrl, tags: DISCOVER_TAGS })
        }
      )
    ] }) })
  );
});
const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const form = await c.req.formData();
  const searchTerm = String(form.get("q") ?? "").trim();
  if (!searchTerm || searchTerm.length < 3) {
    return hv(
      /* @__PURE__ */ jsx(
        View,
        {
          xmlns: "https://hyperview.org/hyperview",
          style: "search-results-stack",
          children: /* @__PURE__ */ jsx(DiscoveryTags, { baseUrl, tags: DISCOVER_TAGS })
        }
      )
    );
  }
  const [[bookError, books], [creatorError, creators]] = await Promise.all([
    searchBooks(searchTerm ?? ""),
    searchCreators(searchTerm ?? "")
  ]);
  if (bookError || creatorError) {
    return hv(
      /* @__PURE__ */ jsx(
        View,
        {
          xmlns: "https://hyperview.org/hyperview",
          style: "search-results-stack",
          children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "Search failed. Try again." })
        }
      )
    );
  }
  return hv(
    /* @__PURE__ */ jsx(HVSearchResults, { books, creators, baseUrl })
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  discoveryTagStyles(),
  searchFormStyles(),
  hvSearchResultsStyles()
] });
export {
  GET,
  POST,
  SEARCH_RESULTS_TARGET_ID
};
