import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import Table from "../../../../../components/app/Table.js";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll.js";
import { formatDate } from "../../../../../utils.js";
import { getAdminCreatorInterviews } from "../../creators/services.js";
import Button from "../../../../../components/app/Button.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import { deleteIcon } from "../../../../../lib/icons.js";
import InterviewStatusForm from "./InterviewStatusForm.js";
const interviewStatusLabel = (status) => {
  switch (status) {
    case "published":
      return "Published";
    case "completed":
      return "Completed";
    case "expired":
      return "Expired";
    default:
      return "Sent";
  }
};
const InterviewsTableAndFilter = async ({
  currentPath,
  currentPage,
  statusType,
  searchQuery
}) => {
  const [error, result] = await getAdminCreatorInterviews(
    currentPage,
    searchQuery,
    statusType
  );
  if (error) return /* @__PURE__ */ jsxs("div", { children: [
    "Error: ",
    error.reason
  ] });
  if (!result?.interviews) return /* @__PURE__ */ jsx("div", { children: "No interviews found" });
  const { interviews, totalPages, page } = result;
  const targetId = "interviews-table-body";
  return /* @__PURE__ */ jsx("div", { "x-data": true, children: /* @__PURE__ */ jsxs(
    "div",
    {
      id: "interviews-table-container",
      class: "flex flex-col gap-4",
      "x-ref": "paginationContent",
      children: [
        /* @__PURE__ */ jsx(InterviewStatusForm, { statusType }),
        /* @__PURE__ */ jsxs(Table, { id: "interviews-table", children: [
          /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Creator" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Recipient" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Status" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Sent" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Completed" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Promo image" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: "append", children: interviews.map((interview) => /* @__PURE__ */ jsx(InterviewTableRow, { interview }, interview.id)) })
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
var InterviewsTableAdmin_default = InterviewsTableAndFilter;
const InterviewTableRow = ({
  interview
}) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()"
  };
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/interviews/view/${interview.id}`, target: "_blank", children: interview.creator.displayName }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: interview.recipientEmail }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: interviewStatusLabel(interview.status) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: interview.invitedAt ? formatDate(interview.invitedAt) : "-" }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: interview.completedAt ? formatDate(interview.completedAt) : "-" }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: interview.promoImageUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: interview.promoImageUrl,
        alt: "Promo",
        class: "w-16 h-16 object-cover rounded"
      }
    ) : "-" }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("a", { href: `/dashboard/admin/interviews/${interview.id}`, target: "_blank", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: /* @__PURE__ */ jsx("span", { children: "Edit" }) }) }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      FormDelete,
      {
        action: `/dashboard/admin/interviews/${interview.id}`,
        ...alpineAttrs,
        children: /* @__PURE__ */ jsx("button", { type: "submit", class: "cursor-pointer hover:text-red-500", children: deleteIcon })
      }
    ) })
  ] }, interview.id);
};
export {
  InterviewsTableAdmin_default as default
};
