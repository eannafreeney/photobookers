import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Table from "../../../../../components/app/Table.js";
import StatusPill from "../../components/StatusPill.js";
import PublishMagazineIssueToggle from "./PublishToggle.js";
import Link from "../../../../../components/app/Link.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import { deleteIcon, editIcon } from "../../../../../lib/icons.js";
import { deleteRowAttrs } from "../../../../../lib/utils.js";
const MagazineTable = ({ issues }) => {
  if (issues.length === 0) {
    return /* @__PURE__ */ jsx("p", { class: "border-t border-outline pt-6 text-sm text-on-surface", children: "No issues yet. Generate your first draft above." });
  }
  return /* @__PURE__ */ jsxs(Table, { id: "magazine-issues-table", children: [
    /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "#" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Status" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Theme" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Books" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Published" }),
      /* @__PURE__ */ jsx(Table.HeadRow, { children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsx(Table.Body, { children: issues.map((issue) => /* @__PURE__ */ jsx(TableRow, { issue }, issue.id)) })
  ] });
};
var MagazineTable_default = MagazineTable;
const TableRow = ({ issue }) => {
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: "font-semibold text-on-surface-strong tabular-nums", children: issue.issueNumber ?? "\u2014" }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(StatusPill, { status: issue.status }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      Link,
      {
        href: `/dashboard/admin/magazine/${issue.id}`,
        className: "font-display text-base font-medium text-on-surface-strong hover:text-accent no-underline",
        children: issue.title
      }
    ) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: "line-clamp-1 max-w-88 text-on-surface", children: issue.theme ?? "\u2014" }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: "tabular-nums text-on-surface", children: issue.bookCount }) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(
      PublishMagazineIssueToggle,
      {
        issueId: issue.id,
        isPublished: issue.status === "published",
        redirect: "/dashboard/admin/magazine"
      }
    ) }),
    /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Link, { href: `/dashboard/admin/magazine/${issue.id}`, target: "_blank", children: /* @__PURE__ */ jsx("button", { class: "cursor-pointer", children: editIcon() }) }),
      /* @__PURE__ */ jsx(
        FormDelete,
        {
          action: `/dashboard/admin/magazine/${issue.id}/delete`,
          ...deleteRowAttrs,
          children: /* @__PURE__ */ jsx("button", { type: "submit", class: "cursor-pointer hover:text-red-500", children: deleteIcon })
        }
      )
    ] }) })
  ] });
};
export {
  MagazineTable_default as default
};
