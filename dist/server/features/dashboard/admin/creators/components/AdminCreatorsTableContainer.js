import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import TableSearch from "../../../../../components/app/TableSearch.js";
import AdminCreatorsTableAndFilter from "./AdminCreatorsTableAndFilter.js";
const AdminCreatorsTableContainer = async ({
  searchQuery,
  currentPage,
  currentPath
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Creators" }),
    /* @__PURE__ */ jsx("div", { class: "flex items-center justify-between gap-4", children: /* @__PURE__ */ jsx(
      TableSearch,
      {
        target: "creators-table-container",
        action: "/dashboard/admin/creators",
        placeholder: "Filter creators..."
      }
    ) }),
    /* @__PURE__ */ jsx(
      AdminCreatorsTableAndFilter,
      {
        currentPage,
        searchQuery,
        currentPath
      }
    )
  ] });
};
var AdminCreatorsTableContainer_default = AdminCreatorsTableContainer;
export {
  AdminCreatorsTableContainer_default as default
};
