import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendPOTWCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import {
  executePOTWEmail,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getPublisherOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services";
import SendPOTWCreatorEmailButton from "../../../../../features/dashboard/admin/planner/components/SendPOTWCreatorEmailButton";

export const POST = createRoute(
  formValidator(sendPOTWCreatorEmailFormSchema),
  async (c) => {
    const { creatorId, weekStart } = c.req.valid("form");

    const [potwErr, potwRow] =
      await getPublisherOfTheWeekForDateQuery(weekStart);
    if (potwErr || !potwRow)
      return showErrorAlert(c, "Publisher of the week not found");

    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      weekStart,
      action: "/dashboard/admin/planner/publisher-of-the-week/set-send-email",
      title: "Send Publisher Email",
      targetId: `potw-email-${potwRow.id}-publisher`,
      fallbackTargetNode: (
        <SendPOTWCreatorEmailButton
          publisherOfTheWeek={potwRow}
          creatorId={creatorId}
        />
      ),
    });
    if (response || !creator) return response!;

    return executePOTWEmail({ c, creator, creatorId, weekStart });
  },
);
