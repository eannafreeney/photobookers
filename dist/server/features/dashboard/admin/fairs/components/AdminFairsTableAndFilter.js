import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import Table from "../../../../../components/app/Table.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import { deleteIcon, editIcon } from "../../../../../lib/icons.js";
import { formatDate } from "../../../../../utils.js";
import { getAllFairsAdmin } from "../services.js";
import FairStatusBadge from "./FairStatusBadge.js";
import FairPublishToggle from "./FairPublishToggle.js";
import FairPreviewButton from "./FairPreviewButton.js";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll.js";
import { deleteRowAttrs } from "../../../../../lib/utils.js";
const AdminFairsTableAndFilter = async ({
  status = void 0,
  currentPage,
  searchQuery,
  currentPath
}) => {
  const [error, result] = await getAllFairsAdmin(
    currentPage,
    searchQuery,
    status
  );
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const { fairs, totalPages, page } = result;
  const targetId = "fairs-table-body";
  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@fairs:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/fairs', { target: 'fairs-table-container' })`
  };
  return /* @__PURE__ */ jsx("div", { "x-data": true, children: /* @__PURE__ */ jsxs(
    "div",
    {
      id: "fairs-table-container",
      class: "flex flex-col gap-4",
      "x-ref": "paginationContent",
      children: [
        /* @__PURE__ */ jsxs(Table, { id: "fairs-table", children: [
          /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Name" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Dates" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Location" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Status" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Published" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(Table.Body, { id: targetId, ...tableBodyAttrs, xMerge: "append", children: fairs.map((fair) => /* @__PURE__ */ jsxs("tr", { "x-data": true, children: [
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
              "img",
              {
                src: fair.coverUrl ?? "",
                alt: fair.name,
                class: "w-10 h-10 rounded-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/dashboard/admin/fairs/${fair.id}`, children: /* @__PURE__ */ jsx("span", { class: "font-medium", children: fair.name }) }) }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsxs("div", { class: "text-sm", children: [
              formatDate(fair.startDate),
              " - ",
              formatDate(fair.endDate)
            ] }) }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("div", { class: "text-sm", children: fair.city && fair.country ? `${fair.city}, ${fair.country}` : fair.city || fair.country || "-" }) }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
              FairStatusBadge,
              {
                id: `fair-status-${fair.id}`,
                status: fair.status
              }
            ) }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(FairPublishToggle, { fairId: fair.id, status: fair.status }) }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsxs("div", { class: "flex gap-2 items-center", children: [
              /* @__PURE__ */ jsx(
                FairPreviewButton,
                {
                  fairId: fair.id,
                  slug: fair.slug,
                  status: fair.status
                }
              ),
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: `/dashboard/admin/fairs/${fair.id}`,
                  title: "Edit",
                  target: "_blank",
                  children: editIcon()
                }
              ),
              /* @__PURE__ */ jsx(
                FormDelete,
                {
                  action: `/dashboard/admin/fairs/${fair.id}`,
                  ...deleteRowAttrs,
                  children: /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "submit",
                      class: "cursor-pointer hover:text-red-500",
                      children: deleteIcon
                    }
                  )
                }
              )
            ] }) })
          ] }, fair.id)) })
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
var AdminFairsTableAndFilter_default = AdminFairsTableAndFilter;
export {
  AdminFairsTableAndFilter_default as default
};
