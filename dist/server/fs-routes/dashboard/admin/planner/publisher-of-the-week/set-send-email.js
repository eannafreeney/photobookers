import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator.js";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema.js";
import {
  executePOTWEmail,
  updateCreatorEmailOrError
} from "../../../../../features/dashboard/admin/planner/emailFlow.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { buildSpotlightEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders.js";
import { getPublisherOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services.js";
const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const { creatorId, email, weekStart } = c.req.valid("form");
    if (!weekStart) return showErrorAlert(c, "Invalid email payload");
    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email
    });
    if (response || !creator) return response;
    const [potwErr, potwRow] = await getPublisherOfTheWeekForDateQuery(weekStart);
    if (potwErr || !potwRow)
      return showErrorAlert(c, "Publisher of the week not found");
    const badge = buildSpotlightEmailBadgeProps({
      spotlight: "publisher",
      row: potwRow,
      creatorId,
      email: creator.email,
      emailKind: "advance"
    });
    return executePOTWEmail({ c, creator, creatorId, weekStart, badge });
  }
);
export {
  POST
};
