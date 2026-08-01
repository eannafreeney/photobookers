import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  NewsletterBrevoPanel,
  NewsletterCampaignControls
} from "./NewsletterCampaignSendPanels.js";
import CampaignPreview from "./CampaignPreview.js";
import CampaignTextForm from "./CampaignTextForm.js";
const CampaignOverview = ({
  selectedCampaign,
  previewHtml,
  defaultTestEmail
}) => /* @__PURE__ */ jsxs("div", { class: "space-y-4", children: [
  /* @__PURE__ */ jsx(NewsletterCampaignControls, { selectedCampaign }),
  /* @__PURE__ */ jsx(
    NewsletterBrevoPanel,
    {
      selectedCampaign,
      defaultTestEmail
    }
  ),
  /* @__PURE__ */ jsx(CampaignPreview, { previewHtml }),
  /* @__PURE__ */ jsxs("div", { class: "rounded border border-outline bg-surface p-4", children: [
    /* @__PURE__ */ jsx("h2", { class: "text-lg font-semibold text-on-surface-strong", children: "Edit draft copy" }),
    /* @__PURE__ */ jsx(CampaignTextForm, { selectedCampaign })
  ] })
] });
var CampaignOverview_default = CampaignOverview;
export {
  CampaignOverview_default as default
};
