import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { newsletterCampaignParamSchema } from "../../../../../features/dashboard/admin/newsletters/schema.js";
import { regenerateCampaignContent } from "../../../../../features/dashboard/admin/newsletters/services.js";
import Alert from "../../../../../components/app/Alert.js";
const POST = createRoute(
  paramValidator(newsletterCampaignParamSchema),
  async (c) => {
    const { campaignId } = c.req.valid("param");
    const [error, generated] = await regenerateCampaignContent(campaignId);
    if (error) {
      return c.html(/* @__PURE__ */ jsx(Alert, { type: "danger", message: error.reason }));
    }
    const itemCount = generated?.botdEntries.length ?? 0;
    return c.html(
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Regenerated ${itemCount} BOTD item${itemCount === 1 ? "" : "s"}.`
        }
      )
    );
  }
);
export {
  POST
};
