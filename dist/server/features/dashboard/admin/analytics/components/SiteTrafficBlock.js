import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getSiteTrafficDashboard } from "../../../../site-analytics/siteTraffic.js";
import SiteTrafficAcquisitionTable from "./SiteTrafficAcquisitionTable.js";
import SiteTrafficCampaignsTable from "./SiteTrafficCampaignsTable.js";
import SiteTrafficDevicesSection from "./SiteTrafficDevicesSection.js";
import SiteTrafficGeographyTable from "./SiteTrafficGeographyTable.js";
import SiteTrafficLandingPagesTable from "./SiteTrafficLandingPagesTable.js";
import SiteTrafficOverviewSection from "./SiteTrafficOverviewSection.js";
import SiteTrafficReferrersTable from "./SiteTrafficReferrersTable.js";
import { siteTrafficDisclaimer } from "./siteTrafficShared.js";
import SiteTrafficTopPagesTable from "./SiteTrafficTopPagesTable.js";
import SiteTrafficTrendSection from "./SiteTrafficTrendSection.js";
const SiteTrafficBlock = async ({ dateRange }) => {
  const [error, data] = await getSiteTrafficDashboard(dateRange);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-12", children: [
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: siteTrafficDisclaimer }),
    error ? /* @__PURE__ */ jsx("div", { class: "rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface", children: error.reason }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SiteTrafficOverviewSection, { data, dateRange }),
      /* @__PURE__ */ jsx(SiteTrafficTrendSection, { data, dateRange }),
      /* @__PURE__ */ jsx(SiteTrafficDevicesSection, { data }),
      /* @__PURE__ */ jsx(SiteTrafficAcquisitionTable, { data }),
      /* @__PURE__ */ jsx(SiteTrafficReferrersTable, { data }),
      /* @__PURE__ */ jsx(SiteTrafficLandingPagesTable, { data }),
      /* @__PURE__ */ jsx(SiteTrafficTopPagesTable, { data }),
      /* @__PURE__ */ jsx(SiteTrafficGeographyTable, { data }),
      /* @__PURE__ */ jsx(SiteTrafficCampaignsTable, { data })
    ] })
  ] });
};
var SiteTrafficBlock_default = SiteTrafficBlock;
export {
  SiteTrafficBlock_default as default
};
