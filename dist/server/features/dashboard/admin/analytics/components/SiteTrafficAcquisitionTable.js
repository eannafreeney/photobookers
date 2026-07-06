import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import WindowTable from "../../components/WindowTable.js";
import { SiteTrafficEmptyTable } from "./siteTrafficShared.js";
const SiteTrafficAcquisitionTable = ({ data }) => {
  const { acquisition } = data;
  if (acquisition.length === 0) {
    return /* @__PURE__ */ jsx(
      SiteTrafficEmptyTable,
      {
        title: "Traffic acquisition",
        columns: ["Channel", "Source", "Medium", "Sessions", "Users"],
        emptyMessage: "No acquisition data for this period."
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Traffic acquisition" }),
    /* @__PURE__ */ jsx(WindowTable, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Channel" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Source" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Medium" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Sessions" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Users" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { children: acquisition.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.channelGroup }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.source }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.medium }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.sessions.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.totalUsers.toLocaleString() })
      ] }, `${row.channelGroup}-${row.source}-${row.medium}`)) })
    ] }) })
  ] });
};
var SiteTrafficAcquisitionTable_default = SiteTrafficAcquisitionTable;
export {
  SiteTrafficAcquisitionTable_default as default
};
