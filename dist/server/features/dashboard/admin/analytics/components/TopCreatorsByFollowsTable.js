import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import { capitalize } from "../../../../../utils.js";
import ListNavigation from "../../../../app/components/ListNavigation.js";
import { getTopCreatorsByFollows } from "../../../../book-analytics/engagement.js";
import WindowTable from "../../components/WindowTable.js";
const TopCreatorsByFollowsTable = async ({
  dateRange,
  currentPath,
  currentPage,
  pageParam
}) => {
  const [error, result] = await getTopCreatorsByFollows(dateRange, currentPage);
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const targetId = "analytics-top-creators-by-follows";
  const { creators, totalPages, page } = result;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Top creators by follows" }),
    /* @__PURE__ */ jsxs(WindowTable, { children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Name" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Type" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Follows" })
        ] }) }),
        /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: "append", children: creators.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(Table.BodyRow, { children: "No follows yet." }) }) : creators.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.BodyRow, { children: row.coverUrl ? /* @__PURE__ */ jsx(
            "img",
            {
              src: row.coverUrl,
              alt: row.displayName,
              class: "h-12 w-auto"
            }
          ) : null }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${row.slug}`, target: "_blank", children: row.displayName }) }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: capitalize(row.type) }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: row.followCount })
        ] }, row.creatorId)) })
      ] }),
      /* @__PURE__ */ jsx(
        ListNavigation,
        {
          isInfiniteScroll: true,
          currentPath,
          page,
          totalPages,
          targetId,
          pageParam,
          navId: "pagination-top-creators-by-follows-table"
        }
      )
    ] })
  ] });
};
var TopCreatorsByFollowsTable_default = TopCreatorsByFollowsTable;
export {
  TopCreatorsByFollowsTable_default as default
};
