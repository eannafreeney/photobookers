import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import WindowTable from "../../components/WindowTable.js";
import { SiteTrafficEmptyTable } from "./siteTrafficShared.js";
const SiteTrafficReferrersTable = ({ data }) => {
  const { referrers } = data;
  if (referrers.length === 0) {
    return /* @__PURE__ */ jsx(
      SiteTrafficEmptyTable,
      {
        title: "Referring sites",
        columns: ["Source", "Sessions", "Users"],
        emptyMessage: "No referral traffic for this period."
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Referring sites" }),
    /* @__PURE__ */ jsx(WindowTable, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Source" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Sessions" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Users" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { children: referrers.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.source }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.sessions.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.totalUsers.toLocaleString() })
      ] }, row.source)) })
    ] }) })
  ] });
};
var SiteTrafficReferrersTable_default = SiteTrafficReferrersTable;
export {
  SiteTrafficReferrersTable_default as default
};
