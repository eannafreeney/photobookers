import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendAOTWCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import {
  executeAOTWEmail,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { getArtistOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services";
import SendAOTWCreatorEmailButton from "../../../../../features/dashboard/admin/planner/components/SendAOTWCreatorEmailButton";

export const POST = createRoute(
  formValidator(sendAOTWCreatorEmailFormSchema),
  async (c) => {
    const { creatorId, weekStart } = c.req.valid("form");

    const [aotwErr, aotwRow] = await getArtistOfTheWeekForDateQuery(weekStart);
    if (aotwErr || !aotwRow)
      return showErrorAlert(c, "Artist of the week not found");

    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      weekStart,
      action: `/dashboard/admin/planner/artist-of-the-week/set-send-email`,
      title: `Send Artist Email`,
      targetId: `aotw-email-${aotwRow.id}-artist`,
      fallbackTargetNode: (
        <SendAOTWCreatorEmailButton
          artistOfTheWeek={aotwRow}
          creatorId={creatorId}
        />
      ),
    });
    if (response) return response;
    if (!creator) return showErrorAlert(c, "Creator not found");

    return executeAOTWEmail({ c, creator, creatorId, weekStart });
  },
);
