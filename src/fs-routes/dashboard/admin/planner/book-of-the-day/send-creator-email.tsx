import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendBOTDCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { capitalize } from "../../../../../utils";
import {
  executeBOTDEmail,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { buildBotdEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders";
import { renderPlannerEmailSuccess } from "../../../../../features/dashboard/admin/planner/renderPlannerEmailSuccess";
import EmailStatusBadge from "../../../../../features/dashboard/admin/planner/components/EmailStatusBadge";
import { formatBotdDateLong } from "../../../../../features/dashboard/admin/planner/utils";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getBookOfTheDayForDateQuery } from "../../../../../features/dashboard/admin/planner/services";
import { sendManualBotdEmail } from "../../../../../features/dashboard/admin/planner/botdEmailServices";
import { normalizeStoredDate, toUtcStartOfDay } from "../../../../../lib/utils";

export const POST = createRoute(
  formValidator(sendBOTDCreatorEmailFormSchema),
  async (c) => {
    const { bookId, creatorId, date, recipientType, emailKind } =
      c.req.valid("form");

    const [botdErr, botdRow] = await getBookOfTheDayForDateQuery(date);
    if (botdErr || !botdRow)
      return showErrorAlert(c, "Book of the day not found");

    const botdDay = toUtcStartOfDay(normalizeStoredDate(date));
    const botdDateLabel = formatBotdDateLong(botdDay);
    const badge = buildBotdEmailBadgeProps({
      bookOfTheDay: botdRow,
      recipientType,
      emailKind,
    });

    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      bookId,
      recipientType,
      date: botdDay,
      action: "/dashboard/admin/planner/book-of-the-day/set-send-email",
      title: `Email ${capitalize(recipientType)} — Book of the Day on ${botdDateLabel}`,
      targetId: badge.targetId,
      fallbackTargetNode: <EmailStatusBadge {...badge} />,
    });
    if (response || !creator) return response!;

    if (emailKind === "advance") {
      return executeBOTDEmail({
        c,
        creator,
        date: botdDay,
        recipientType,
        bookId,
        badge,
      });
    }

    const [sendError, updatedBotd] = await sendManualBotdEmail(
      botdDay,
      recipientType,
      emailKind,
    );
    if (sendError) return showErrorAlert(c, sendError.reason);
    if (!updatedBotd) return showErrorAlert(c, "Book of the day not found");

    const updatedBadge = buildBotdEmailBadgeProps({
      bookOfTheDay: updatedBotd,
      recipientType,
      emailKind,
    });

    return renderPlannerEmailSuccess(c, creator, {
      ...updatedBadge,
      hasEmail: true,
    });
  },
);
