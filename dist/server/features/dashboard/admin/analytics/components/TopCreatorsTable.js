import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import ListNavigation from "../../../../app/components/ListNavigation.js";
import { getTopCreatorsByClicks } from "../../../../purchase-clicks/services.js";
import WindowTable from "../../components/WindowTable.js";
const TopCreatorsTable = async ({
  role,
  title,
  dateRange,
  currentPath,
  currentPage,
  pageParam
}) => {
  const [error, result] = await getTopCreatorsByClicks(
    role,
    dateRange,
    currentPage
  );
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const targetId = `analytics-top-${role}s`;
  const { creators, totalPages, page } = result;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(SectionTitle, { children: [
      title,
      " by outbound clicks"
    ] }),
    /* @__PURE__ */ jsxs(WindowTable, { children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Name" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Outbound clicks" })
        ] }) }),
        /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: "append", children: creators.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(Table.BodyRow, { children: "No outbound clicks yet." }) }) : creators.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.BodyRow, { children: row.coverUrl ? /* @__PURE__ */ jsx(
            "img",
            {
              src: row.coverUrl,
              alt: row.displayName,
              class: "h-12 w-auto"
            }
          ) : null }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${row.slug}`, target: "_blank", children: row.displayName }) }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: row.clickCount })
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
          navId: `pagination-${role}-table`
        }
      )
    ] })
  ] });
};
var TopCreatorsTable_default = TopCreatorsTable;
export {
  TopCreatorsTable_default as default
};
