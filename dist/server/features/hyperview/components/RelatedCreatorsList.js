import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Spinner, Style, View } from "../../../lib/hxml-comps.js";
import SpotlightCreatorRow, {
  spotlightCreatorRowStyles
} from "./spotlight/SpotlightCreatorRow.js";
const RELATED_CREATORS_LOAD_MORE_ID = "related-creators-load-more";
const RelatedCreatorsList = ({
  creators,
  page = 1,
  hasMore = false,
  loadMoreHref,
  followingByCreatorId = {},
  baseUrl,
  role
}) => {
  return /* @__PURE__ */ jsxs("view", { xmlns: "https://hyperview.org/hyperview", children: [
    /* @__PURE__ */ jsx(View, { style: "related-creators-list", children: creators.map((creator) => /* @__PURE__ */ jsx(
      SpotlightCreatorRow,
      {
        creator,
        role,
        baseUrl,
        isFollowing: followingByCreatorId[creator.id] ?? false
      },
      creator.id
    )) }),
    hasMore && loadMoreHref ? /* @__PURE__ */ jsx(
      "view",
      {
        id: RELATED_CREATORS_LOAD_MORE_ID,
        style: "related-creators-spinner",
        trigger: "visible",
        once: "true",
        verb: "get",
        href: `${loadMoreHref}?page=${page + 1}`,
        action: "replace",
        children: /* @__PURE__ */ jsx(Spinner, {})
      }
    ) : null
  ] });
};
var RelatedCreatorsList_default = RelatedCreatorsList;
const relatedCreatorsListStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "related-creators-spinner",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 16,
      paddingBottom: 16
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "related-creators-list", flexDirection: "column", gap: 12 }),
  spotlightCreatorRowStyles()
] });
export {
  RELATED_CREATORS_LOAD_MORE_ID,
  RelatedCreatorsList_default as default,
  relatedCreatorsListStyles
};
