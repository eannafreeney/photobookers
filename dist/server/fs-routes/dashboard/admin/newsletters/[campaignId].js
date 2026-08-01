import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import {
  buildCampaignPreviewHtml,
  getNewsletterCampaignById
} from "../../../../features/dashboard/admin/newsletters/services.js";
import CampaignHeader from "../../../../features/dashboard/admin/newsletters/components/CampaignHeader.js";
import CampaignOverview from "../../../../features/dashboard/admin/newsletters/components/CampaignOverview.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const campaignId = c.req.param("campaignId");
  const selectedCampaign = campaignId ? await getNewsletterCampaignById(campaignId) ?? null : null;
  const previewHtml = selectedCampaign ? await buildCampaignPreviewHtml(selectedCampaign) : "";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Weekly BOTD Newsletter",
        user,
        currentPath,
        flash,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: selectedCampaign ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(CampaignHeader, { selectedCampaign }),
          /* @__PURE__ */ jsx(
            CampaignOverview,
            {
              selectedCampaign,
              previewHtml,
              defaultTestEmail: user?.email ?? ""
            }
          )
        ] }) : /* @__PURE__ */ jsx("div", { class: "rounded border border-outline bg-surface p-4 text-sm text-on-surface", children: "Newsletter not found." }) }) })
      }
    )
  );
});
export {
  GET
};
