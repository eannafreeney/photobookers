import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator.js";
import {
  newsletterBrevoTestSchema,
  newsletterCampaignParamSchema
} from "../../../../../../features/dashboard/admin/planner/schema.js";
import { sendNewsletterBrevoTest } from "../../../../../../features/dashboard/admin/planner/newsletterBrevoServices.js";
import Alert from "../../../../../../components/app/Alert.js";
const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  formValidator(newsletterBrevoTestSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const { email } = c.req.valid("form");
    const [error, result] = await sendNewsletterBrevoTest(
      campaignId,
      email || void 0
    );
    if (error) {
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: error.reason }));
    }
    return c.html(
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Brevo test email sent to ${result.recipient}.`
        }
      )
    );
  }
);
export {
  POST
};
