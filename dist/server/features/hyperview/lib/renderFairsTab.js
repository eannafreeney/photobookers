import { jsx } from "hono/jsx/jsx-runtime";
import { hyperview } from "../../../lib/hxml.js";
import { Text } from "../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import FairsList, {
  FairsListMessage
} from "../components/FairsList.js";
const PAGE_SIZE = 30;
const renderFairsTab = async (c, fetchFairs, tabPath) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const loadMoreHref = `${baseUrl}/hyperview/fairs/tab/${tabPath}`;
  const [error, result] = await fetchFairs(currentPage, PAGE_SIZE);
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(FairsListMessage, { children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "Failed to load fairs." }) })
    );
  }
  const fairs = result?.fairs ?? [];
  const totalPages = result?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;
  if (currentPage === 1 && fairs.length === 0) {
    return hv(
      /* @__PURE__ */ jsx(FairsListMessage, { children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No fairs found." }) })
    );
  }
  const list = /* @__PURE__ */ jsx(
    FairsList,
    {
      fairs,
      baseUrl,
      page: currentPage,
      hasMore,
      loadMoreHref
    }
  );
  if (currentPage > 1) {
    return hv(/* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: list }));
  }
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: list })
  );
};
export {
  renderFairsTab
};
