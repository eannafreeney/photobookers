import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import WindowTable from "../../components/WindowTable.js";
import { SiteTrafficEmptyTable } from "./siteTrafficShared.js";
const SiteTrafficCampaignsTable = ({ data }) => {
  const { campaigns } = data;
  if (campaigns.length === 0) {
    return /* @__PURE__ */ jsx(
      SiteTrafficEmptyTable,
      {
        title: "Campaigns (UTM)",
        columns: ["Campaign", "Source", "Medium", "Sessions", "Users"],
        emptyMessage: "No campaign traffic for this period."
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Campaigns (UTM)" }),
    /* @__PURE__ */ jsx(WindowTable, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Campaign" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Source" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Medium" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Sessions" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Users" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { children: campaigns.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.campaign }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.source }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.medium }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.sessions.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.totalUsers.toLocaleString() })
      ] }, `${row.campaign}-${row.source}-${row.medium}`)) })
    ] }) })
  ] });
};
var SiteTrafficCampaignsTable_default = SiteTrafficCampaignsTable;
export {
  SiteTrafficCampaignsTable_default as default
};
