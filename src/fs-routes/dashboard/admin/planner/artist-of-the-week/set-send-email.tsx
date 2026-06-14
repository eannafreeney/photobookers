import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import {
  executeAOTWEmail,
  updateCreatorEmailOrError,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { buildSpotlightEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders";
import { getArtistOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services";

export const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const { creatorId, email, weekStart } = c.req.valid("form");
    if (!weekStart) return showErrorAlert(c, "Invalid email payload");

    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email,
    });
    if (response || !creator) return response!;

    const [aotwErr, aotwRow] = await getArtistOfTheWeekForDateQuery(weekStart);
    if (aotwErr || !aotwRow)
      return showErrorAlert(c, "Artist of the week not found");

    const badge = buildSpotlightEmailBadgeProps({
      spotlight: "artist",
      row: aotwRow,
      creatorId,
      email: creator.email,
      emailKind: "advance",
    });

    return executeAOTWEmail({ c, creator, creatorId, weekStart, badge });
  },
);
