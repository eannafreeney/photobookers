import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { newsletterCampaignParamSchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import { sendNewsletterBrevoToList } from "../../../../../../features/dashboard/admin/planner/newsletterBrevoServices.js";
import {
  NewsletterBrevoPanel,
  NewsletterCampaignControls
} from "../../../../../../features/dashboard/admin/planner/components/NewsletterCampaignSendPanels.js";
import Alert from "../../../../../../components/app/Alert.js";
import { getUser } from "../../../../../../utils.js";
const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const [error, result] = await sendNewsletterBrevoToList(campaignId);
    if (error) {
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: error.reason }));
    }
    const user = await getUser(c);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: "success",
            message: "Newsletter sent via Brevo to your configured list."
          }
        ),
        /* @__PURE__ */ jsx(NewsletterCampaignControls, { selectedCampaign: result.campaign }),
        /* @__PURE__ */ jsx(
          NewsletterBrevoPanel,
          {
            selectedCampaign: result.campaign,
            defaultTestEmail: user?.email ?? ""
          }
        )
      ] })
    );
  }
);
export {
  POST
};
