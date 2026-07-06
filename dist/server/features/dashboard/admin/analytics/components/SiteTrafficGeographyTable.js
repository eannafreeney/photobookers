import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import WindowTable from "../../components/WindowTable.js";
import { SiteTrafficEmptyTable } from "./siteTrafficShared.js";
const SiteTrafficGeographyTable = ({ data }) => {
  const { geography } = data;
  if (geography.length === 0) {
    return /* @__PURE__ */ jsx(
      SiteTrafficEmptyTable,
      {
        title: "Geography",
        columns: ["Country", "Sessions", "Users"],
        emptyMessage: "No geography data for this period."
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Geography" }),
    /* @__PURE__ */ jsx(WindowTable, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Country" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Sessions" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Users" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { children: geography.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.country }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.sessions.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.totalUsers.toLocaleString() })
      ] }, row.country)) })
    ] }) })
  ] });
};
var SiteTrafficGeographyTable_default = SiteTrafficGeographyTable;
export {
  SiteTrafficGeographyTable_default as default
};
