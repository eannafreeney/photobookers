import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import Table from "../../../../../components/app/Table.js";
import { editIcon } from "../../../../../lib/icons.js";
import { getAllStoresAdmin } from "../services.js";
import StoreStatusBadge from "./StoreStatusBadge.js";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll.js";
import DeleteStoreButton from "./DeleteStoreButton.js";
import StatusPill from "../../components/StatusPill.js";
const AdminStoresTableAndFilter = async ({
  currentPage,
  searchQuery,
  currentPath
}) => {
  const [error, result] = await getAllStoresAdmin(currentPage, searchQuery);
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const { stores, totalPages, page } = result;
  const targetId = "stores-table-body";
  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@stores:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/stores', { target: 'stores-table-container' })`
  };
  return /* @__PURE__ */ jsx("div", { "x-data": true, children: /* @__PURE__ */ jsxs(
    "div",
    {
      id: "stores-table-container",
      class: "flex flex-col gap-4",
      "x-ref": "paginationContent",
      children: [
        /* @__PURE__ */ jsxs(Table, { id: "stores-table", children: [
          /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Name" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Location" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Status" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Approval" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(Table.Body, { id: targetId, ...tableBodyAttrs, xMerge: "append", children: stores.map((store) => /* @__PURE__ */ jsxs("tr", { "x-data": true, children: [
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/dashboard/admin/stores/${store.id}`, children: /* @__PURE__ */ jsx("span", { class: "font-medium", children: store.name }) }) }),
            /* @__PURE__ */ jsxs(Table.BodyRow, { children: [
              /* @__PURE__ */ jsxs("div", { class: "text-sm", children: [
                store.city,
                ", ",
                store.country
              ] }),
              /* @__PURE__ */ jsx("div", { class: "text-xs text-on-surface-weak", children: store.address })
            ] }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(StoreStatusBadge, { status: store.status }) }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(StatusPill, { status: store.approvalStatus }) }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsxs("div", { class: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: `/dashboard/admin/stores/${store.id}`,
                  title: "Edit",
                  children: editIcon()
                }
              ),
              /* @__PURE__ */ jsx(DeleteStoreButton, { store })
            ] }) })
          ] }, store.id)) })
        ] }),
        /* @__PURE__ */ jsx(
          InfiniteScroll,
          {
            baseUrl: currentPath,
            page,
            totalPages,
            targetId
          }
        )
      ]
    }
  ) });
};
var AdminStoresTableAndFilter_default = AdminStoresTableAndFilter;
export {
  AdminStoresTableAndFilter_default as default
};
