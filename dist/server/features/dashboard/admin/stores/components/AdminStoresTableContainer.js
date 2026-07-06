import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import TableSearch from "../../../../../components/app/TableSearch.js";
import AdminStoresTableAndFilter from "./AdminStoresTableAndFilter.js";
const AdminStoresTableContainer = async ({
  currentPath,
  currentPage,
  searchQuery,
  user
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Bookstores" }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(
        TableSearch,
        {
          target: "stores-table-container",
          action: "/dashboard/admin/stores",
          placeholder: "Filter stores..."
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/admin/stores/create", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "New Store" }) })
    ] }),
    /* @__PURE__ */ jsx(
      AdminStoresTableAndFilter,
      {
        user,
        currentPath,
        currentPage,
        searchQuery
      }
    )
  ] });
};
var AdminStoresTableContainer_default = AdminStoresTableContainer;
export {
  AdminStoresTableContainer_default as default
};
