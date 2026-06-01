import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendBOTDCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { capitalize } from "../../../../../utils";
import {
  executeBOTDEmail,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import SendBOTDCreatorEmailButton from "../../../../../features/dashboard/admin/planner/components/SendBOTDCreatorEmailButton";
import { formatBotdDateLong } from "../../../../../features/dashboard/admin/planner/utils";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getBookOfTheDayForDateQuery } from "../../../../../features/dashboard/admin/planner/services";
import { normalizeStoredDate, toUtcStartOfDay } from "../../../../../lib/utils";

export const POST = createRoute(
  formValidator(sendBOTDCreatorEmailFormSchema),
  async (c) => {
    const { bookId, creatorId, date, recipientType } = c.req.valid("form");

    const [botdErr, botdRow] = await getBookOfTheDayForDateQuery(date);
    if (botdErr || !botdRow)
      return showErrorAlert(c, "Book of the day not found");

    const botdDay = toUtcStartOfDay(normalizeStoredDate(date));
    const botdDateLabel = formatBotdDateLong(botdDay);

    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      bookId,
      recipientType,
      date: botdDay,
      action: "/dashboard/admin/planner/book-of-the-day/set-send-email",
      title: `Email ${capitalize(recipientType)} — Book of the Day on ${botdDateLabel}`,
      targetId: `botd-email-${botdRow.id}-${recipientType}`,
      fallbackTargetNode: (
        <SendBOTDCreatorEmailButton
          recipientType={recipientType}
          bookOfTheDay={botdRow}
          creatorId={creatorId}
          bookId={bookId}
        />
      ),
    });
    if (response || !creator) return response!;

    return executeBOTDEmail({
      c,
      creator,
      date: botdDay,
      recipientType,
      bookId,
    });
  },
);
