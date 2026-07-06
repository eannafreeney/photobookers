import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getAllCreatorsByType } from "../../../../../features/app/services.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { Text } from "../../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import CreatorsList, {
  CreatorsListMessage
} from "../../../../../features/hyperview/components/CreatorsList.js";
const PAGE_SIZE = 20;
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const loadMoreHref = `${baseUrl}/hyperview/creators/tab/artists`;
  const [error, result] = await getAllCreatorsByType(
    "artist",
    currentPage,
    PAGE_SIZE
  );
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(CreatorsListMessage, { children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "Failed to load artists." }) })
    );
  }
  const creators = result?.creators ?? [];
  const totalPages = result?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;
  if (currentPage === 1 && creators.length === 0) {
    return hv(
      /* @__PURE__ */ jsx(CreatorsListMessage, { children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "No artists found." }) })
    );
  }
  const list = /* @__PURE__ */ jsx(
    CreatorsList,
    {
      creators,
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
});
export {
  GET
};
