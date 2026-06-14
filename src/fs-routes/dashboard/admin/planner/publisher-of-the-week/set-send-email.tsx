import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import {
  executePOTWEmail,
  updateCreatorEmailOrError,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { buildSpotlightEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders";
import { getPublisherOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services";

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

    const [potwErr, potwRow] =
      await getPublisherOfTheWeekForDateQuery(weekStart);
    if (potwErr || !potwRow)
      return showErrorAlert(c, "Publisher of the week not found");

    const badge = buildSpotlightEmailBadgeProps({
      spotlight: "publisher",
      row: potwRow,
      creatorId,
      email: creator.email,
      emailKind: "advance",
    });

    return executePOTWEmail({ c, creator, creatorId, weekStart, badge });
  },
);
