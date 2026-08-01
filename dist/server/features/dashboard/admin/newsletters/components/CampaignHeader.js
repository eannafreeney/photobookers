import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getNewsletterCampaignRange } from "../services.js";
import { formatNewsletterWeekRange } from "../utils.js";
const CampaignHeader = ({ selectedCampaign }) => {
  const { weekStart, weekEnd } = getNewsletterCampaignRange(selectedCampaign);
  return /* @__PURE__ */ jsx("div", { class: "mb-6 flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { class: "text-xl font-semibold text-on-surface-strong", children: "Weekly BOTD newsletter" }),
    /* @__PURE__ */ jsxs("p", { class: "mb-3 text-sm text-on-surface", children: [
      "Edition: ",
      formatNewsletterWeekRange(weekStart, weekEnd)
    ] }),
    /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Edit copy, preview the email, send a Brevo test, then send to your list when ready. You can still copy HTML manually if needed." })
  ] }) });
};
var CampaignHeader_default = CampaignHeader;
export {
  CampaignHeader_default as default
};
