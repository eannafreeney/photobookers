import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import TableSearch from "../../../../../components/app/TableSearch.js";
import AdminFairsTableAndFilter from "./AdminFairsTableAndFilter.js";
const AdminFairsTableContainer = async ({
  currentPath,
  currentPage,
  searchQuery,
  user
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Book Fairs" }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(
        TableSearch,
        {
          target: "fairs-table-container",
          action: "/dashboard/admin/fairs",
          placeholder: "Filter fairs..."
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/admin/fairs/create", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "New Fair" }) })
    ] }),
    /* @__PURE__ */ jsx(
      AdminFairsTableAndFilter,
      {
        user,
        currentPath,
        currentPage,
        searchQuery
      }
    )
  ] });
};
var AdminFairsTableContainer_default = AdminFairsTableContainer;
export {
  AdminFairsTableContainer_default as default
};
