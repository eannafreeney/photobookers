import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { AnalyticsStatCard } from "../../../components/AnalyticsStatCard.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
const SiteTrafficDevicesSection = ({ data }) => {
  const { devices } = data;
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Devices" }),
    /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(AnalyticsStatCard, { label: "Mobile sessions", value: devices.mobile }),
      /* @__PURE__ */ jsx(AnalyticsStatCard, { label: "Desktop sessions", value: devices.desktop }),
      /* @__PURE__ */ jsx(AnalyticsStatCard, { label: "Tablet sessions", value: devices.tablet })
    ] })
  ] });
};
var SiteTrafficDevicesSection_default = SiteTrafficDevicesSection;
export {
  SiteTrafficDevicesSection_default as default
};
