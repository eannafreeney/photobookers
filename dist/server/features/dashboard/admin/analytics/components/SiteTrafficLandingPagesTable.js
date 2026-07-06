import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Table from "../../../../../components/app/Table.js";
import { formatEngagementRate } from "../../../../site-analytics/format.js";
import WindowTable from "../../components/WindowTable.js";
import { SiteTrafficEmptyTable } from "./siteTrafficShared.js";
const SiteTrafficLandingPagesTable = ({ data }) => {
  const { landingPages } = data;
  if (landingPages.length === 0) {
    return /* @__PURE__ */ jsx(
      SiteTrafficEmptyTable,
      {
        title: "Landing pages",
        columns: [
          "Landing page",
          "Sessions",
          "Engaged sessions",
          "Engagement rate"
        ],
        emptyMessage: "No landing page data for this period."
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Landing pages" }),
    /* @__PURE__ */ jsx(WindowTable, { children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Landing page" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Sessions" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Engaged sessions" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Engagement rate" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { children: landingPages.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.BodyRow, { children: /* @__PURE__ */ jsx("span", { class: "block max-w-md truncate", children: row.landingPage }) }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.sessions.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: row.engagedSessions.toLocaleString() }),
        /* @__PURE__ */ jsx(Table.BodyRow, { children: formatEngagementRate(row.engagementRate) })
      ] }, row.landingPage)) })
    ] }) })
  ] });
};
var SiteTrafficLandingPagesTable_default = SiteTrafficLandingPagesTable;
export {
  SiteTrafficLandingPagesTable_default as default
};
