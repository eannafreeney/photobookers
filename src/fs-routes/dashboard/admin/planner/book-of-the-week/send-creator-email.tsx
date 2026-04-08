import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendBOTWCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { capitalize } from "../../../../../utils";
import {
  executeBOTWEmail,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import SendBOTWCreatorEmailButton from "../../../../../features/dashboard/admin/planner/components/SendBOTWCreatorEmailButton";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getBookOfTheWeekForDateQuery } from "../../../../../features/dashboard/admin/planner/services";

export const POST = createRoute(
  formValidator(sendBOTWCreatorEmailFormSchema),
  async (c) => {
    const { bookId, creatorId, weekStart, recipientType } = c.req.valid("form");

    const [botwErr, botwRow] = await getBookOfTheWeekForDateQuery(weekStart);
    if (botwErr || !botwRow)
      return showErrorAlert(c, "Book of the week not found");

    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      bookId,
      recipientType,
      weekStart,
      action: "/dashboard/admin/planner/book-of-the-week/set-send-email",
      title: `Send ${capitalize(recipientType)} Email`,
      targetId: `botw-email-${botwRow.id}-${recipientType}`,
      fallbackTargetNode: (
        <SendBOTWCreatorEmailButton
          recipientType={recipientType}
          bookOfTheWeek={botwRow}
          creatorId={creatorId}
          bookId={bookId}
        />
      ),
    });
    if (response || !creator) return response!;

    return executeBOTWEmail({
      c,
      creator,
      weekStart,
      recipientType,
      bookId,
    });
  },
);
