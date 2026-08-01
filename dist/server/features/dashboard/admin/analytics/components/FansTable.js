import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import { getAllFans } from "../../../../book-analytics/audience.js";
import { formatDate } from "../../../../../utils.js";
import ListNavigation from "../../../../app/components/ListNavigation.js";
import WindowTable from "../../components/WindowTable.js";
function fanDisplayName(fan) {
  const fullName = [fan.firstName, fan.lastName].filter(Boolean).join(" ").trim();
  return fullName || fan.email;
}
const FansTable = async ({ currentPage, currentPath }) => {
  const [error, result] = await getAllFans(currentPage);
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const targetId = "analytics-fans-table";
  const { fans, totalPages, page } = result;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Fans" }),
    /* @__PURE__ */ jsxs(WindowTable, { children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Name" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Email" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Joined" })
        ] }) }),
        /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: "append", children: fans.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(Table.BodyRow, { children: "No fans yet." }) }) : fans.map((fan) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/dashboard/admin/users/${fan.id}`, children: fanDisplayName(fan) }) }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: fan.email }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: formatDate(fan.createdAt) })
        ] }, fan.id)) })
      ] }),
      /* @__PURE__ */ jsx(
        ListNavigation,
        {
          isInfiniteScroll: true,
          currentPath,
          page,
          totalPages,
          targetId
        }
      )
    ] })
  ] });
};
var FansTable_default = FansTable;
export {
  FansTable_default as default
};
