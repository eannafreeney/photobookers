import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator.js";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema.js";
import {
  executeAOTWEmail,
  updateCreatorEmailOrError
} from "../../../../../features/dashboard/admin/planner/emailFlow.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { buildSpotlightEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders.js";
import { getArtistOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services.js";
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
    const [aotwErr, aotwRow] = await getArtistOfTheWeekForDateQuery(weekStart);
    if (aotwErr || !aotwRow)
      return showErrorAlert(c, "Artist of the week not found");
    const badge = buildSpotlightEmailBadgeProps({
      spotlight: "artist",
      row: aotwRow,
      creatorId,
      email: creator.email,
      emailKind: "advance"
    });
    return executeAOTWEmail({ c, creator, creatorId, weekStart, badge });
  }
);
export {
  POST
};
