import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import GridPanel from "../../../../components/app/GridPanel.js";
import ScrollReveal from "../../../../components/app/ScrollReveal.js";
import ListNavigation from "../../components/ListNavigation.js";
import StoreCard from "./StoreCard.js";
const StoresGrid = ({
  stores,
  page,
  totalPages,
  baseUrl,
  targetId = "stores-grid",
  isPaginated = false
}) => {
  if (stores.length === 0) {
    return /* @__PURE__ */ jsx("div", { class: "text-center py-12 text-gray-500", children: "No bookstores found." });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(GridPanel, { id: targetId, xMerge: isPaginated ? void 0 : "append", children: stores.map((store) => /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(StoreCard, { store }) })) }),
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
var StoresGrid_default = StoresGrid;
export {
  StoresGrid_default as default
};
