import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import { getAllVerifiedCreators } from "../../../../book-analytics/audience.js";
import { capitalize, formatDate } from "../../../../../utils.js";
import ListNavigation from "../../../../app/components/ListNavigation.js";
import WindowTable from "../../components/WindowTable.js";
const VerifiedCreatorsTable = async ({ currentPage, currentPath }) => {
  const [error, result] = await getAllVerifiedCreators(currentPage);
  if (error) return /* @__PURE__ */ jsx("div", { children: error.reason });
  const targetId = "analytics-verified-creators-table";
  const { creators, totalPages, page } = result;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Verified creators" }),
    /* @__PURE__ */ jsxs(WindowTable, { children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Name" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Type" }),
          /* @__PURE__ */ jsx(Table.HeadRow, { children: "Verified" })
        ] }) }),
        /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: "append", children: creators.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(Table.BodyRow, { children: "No verified creators yet." }) }) : creators.map((creator) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx(Link, { href: `/creators/${creator.slug}`, target: "_blank", children: creator.displayName }) }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: capitalize(creator.type) }),
          /* @__PURE__ */ jsx(Table.BodyRow, { children: creator.verifiedAt ? formatDate(creator.verifiedAt) : "\u2014" })
        ] }, creator.id)) })
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
var VerifiedCreatorsTable_default = VerifiedCreatorsTable;
export {
  VerifiedCreatorsTable_default as default
};
