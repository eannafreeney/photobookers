import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Spinner, Style } from "../../../lib/hxml-comps.js";
import FairCard, { fairCardStyles } from "./FairCard.js";
const FAIRS_LOAD_MORE_ID = "fairs-load-more";
const FairsList = ({ fairs, baseUrl, page, hasMore, loadMoreHref }) => {
  if (fairs.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    fairs.map((fair) => /* @__PURE__ */ jsx(
      FairCard,
      {
        fair,
        variant: "list",
        href: `${baseUrl}/hyperview/fairs/${fair.slug}`
      },
      fair.id
    )),
    hasMore && loadMoreHref ? /* @__PURE__ */ jsx(
      "view",
      {
        id: FAIRS_LOAD_MORE_ID,
        style: "fairs-list-spinner",
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
var FairsList_default = FairsList;
const FairsListMessage = ({ children }) => /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children });
const fairsListStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  fairCardStyles(),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "fairs-list-spinner",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 16,
      paddingBottom: 16
    }
  )
] });
export {
  FAIRS_LOAD_MORE_ID,
  FairsListMessage,
  FairsList_default as default,
  fairsListStyles
};
