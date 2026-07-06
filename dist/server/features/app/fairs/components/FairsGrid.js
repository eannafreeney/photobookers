import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import GridPanel from "../../../../components/app/GridPanel.js";
import ScrollReveal from "../../../../components/app/ScrollReveal.js";
import FairCard from "./FairCard.js";
import ListNavigation from "../../components/ListNavigation.js";
const FairsGrid = ({
  fairs,
  page,
  totalPages,
  baseUrl,
  targetId = "fairs-grid",
  isPaginated = false
}) => {
  if (fairs.length === 0) {
    return /* @__PURE__ */ jsx("div", { class: "text-center py-12 text-gray-500", children: "No fairs found." });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(GridPanel, { id: targetId, xMerge: isPaginated ? void 0 : "append", children: fairs.map((fair) => /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(FairCard, { fair }) })) }),
    /* @__PURE__ */ jsx(
      ListNavigation,
      {
        isInfiniteScroll: true,
        currentPath: baseUrl,
        page,
        totalPages,
        targetId
      }
    )
  ] });
};
var FairsGrid_default = FairsGrid;
export {
  FairsGrid_default as default
};
