import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Card from "../../../../../components/app/Card.js";
import CopyCellCol from "../../../../../components/app/CopyCellCol.js";
import Link from "../../../../../components/app/Link.js";
import Table from "../../../../../components/app/Table.js";
import { findFollowersCount } from "../../../../../db/queries.js";
import { capitalize, formatDate } from "../../../../../utils.js";
import CreatorStatusBadge from "../../components/CreatorStatusBadge.js";
import CreatorTypeForm from "../forms/CreatorTypeForm.js";
import { getAllCreatorProfilesByTypeAdmin } from "../services.js";
import SendWelcomeEmailButton from "./SendWelcomeEmailButton.js";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll.js";
import OwnerCell from "./OwnerCell.js";
import SendInterviewButton from "./SendInterviewButton.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import { deleteIcon } from "../../../../../lib/icons.js";
const AdminCreatorsTableAndFilter = async ({
  type = void 0,
  currentPage,
  searchQuery,
  currentPath
}) => {
  const result = await getAllCreatorProfilesByTypeAdmin(
    searchQuery,
    currentPage,
    type
  );
  if (!result?.creators) {
    return /* @__PURE__ */ jsx("div", { children: "No creators found" });
  }
  const { creators, totalPages, page } = result;
  const targetId = "creators-table-body";
  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@creators:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/creators', { target: 'creators-table-container' })`
  };
  return /* @__PURE__ */ jsx("div", { "x-data": true, children: /* @__PURE__ */ jsxs(
    "div",
    {
      id: "creators-table-container",
      class: "flex flex-col gap-4",
      "x-ref": "paginationContent",
      children: [
        /* @__PURE__ */ jsx(CreatorTypeForm, { type }),
        /* @__PURE__ */ jsxs(Table, { id: "creators-table", children: [
          /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Display Name" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "ID" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Type" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Website" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Status" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Followers" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Created At" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Owner" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Welcome Email" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Interview Email" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(Table.Body, { id: targetId, ...tableBodyAttrs, xMerge: "append", children: creators.map((creator) => /* @__PURE__ */ jsx(CreatorsTableRow, { creator })) })
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
var AdminCreatorsTableAndFilter_default = AdminCreatorsTableAndFilter;
const CreatorsTableRow = ({ creator }) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()"
  };
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      "img",
      {
        src: creator.coverUrl ?? "",
        alt: creator.displayName,
        class: "w-16 h-16 object-cover rounded"
      }
    ) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${creator.slug}`, target: "_blank", children: creator.displayName }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(CopyCellCol, { entity: creator.id }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: capitalize(creator.type) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      Link,
      {
        href: creator.website ?? "",
        target: "_blank",
        title: creator.website ?? "Unassigned",
        className: "inline-block max-w-[180px] truncate",
        children: creator.website
      }
    ) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(CreatorStatusBadge, { creatorStatus: creator.status ?? "stub" }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(FollowersCount, { creatorId: creator.id }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: formatDate(creator.createdAt ?? /* @__PURE__ */ new Date()) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(OwnerCell, { ownerUserId: creator.ownerUserId, creatorId: creator.id }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(SendWelcomeEmailButton, { creator }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(SendInterviewButton, { creator }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("a", { href: `/dashboard/admin/creators/${creator.id}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: /* @__PURE__ */ jsx("span", { children: "Edit" }) }) }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      FormDelete,
      {
        action: `/dashboard/admin/creators/${creator.id}`,
        ...alpineAttrs,
        children: /* @__PURE__ */ jsx("button", { type: "submit", class: "cursor-pointer hover:text-red-500", children: deleteIcon })
      }
    ) })
  ] });
};
const FollowersCount = async ({ creatorId }) => {
  const followerCount = await findFollowersCount(creatorId);
  return /* @__PURE__ */ jsx(Card.Text, { children: followerCount.toString() ?? "0" });
};
export {
  AdminCreatorsTableAndFilter_default as default
};
