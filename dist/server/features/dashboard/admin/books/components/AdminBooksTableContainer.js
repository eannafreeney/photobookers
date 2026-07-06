import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import TableSearch from "../../../../../components/app/TableSearch.js";
import AdminBooksTableAndFilter from "./AdminBooksTableAndFilter.js";
const AdminBooksTableContainer = async ({
  currentPath,
  currentPage,
  searchQuery,
  user
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Books" }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(
        TableSearch,
        {
          target: "books-table-container",
          action: "/dashboard/admin/books",
          placeholder: "Filter books..."
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/admin/books/create", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "New Book" }) })
    ] }),
    /* @__PURE__ */ jsx(
      AdminBooksTableAndFilter,
      {
        user,
        currentPath,
        currentPage,
        searchQuery
      }
    )
  ] });
};
var AdminBooksTableContainer_default = AdminBooksTableContainer;
export {
  AdminBooksTableContainer_default as default
};
