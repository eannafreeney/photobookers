import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import WindowTable from "../../components/WindowTable.js";
import { SiteTrafficEmptyTable } from "./siteTrafficShared.js";
const SiteTrafficTopPagesTable = ({ data }) => {
  const { topPages } = data;
  if (topPages.length === 0) {
    return /* @__PURE__ */ jsx(
      SiteTrafficEmptyTable,
      {
        title: "Top pages",
        columns: ["Page path", "Page views", "Sessions"],
        emptyMessage: "No page view data for this period."
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Top pages" }),
    /* @__PURE__ */ jsx(WindowTable, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Page path" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Page views" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Sessions" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { children: topPages.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: "block max-w-md truncate", children: row.pagePath }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.screenPageViews.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.sessions.toLocaleString() })
      ] }, row.pagePath)) })
    ] }) })
  ] });
};
var SiteTrafficTopPagesTable_default = SiteTrafficTopPagesTable;
export {
  SiteTrafficTopPagesTable_default as default
};
