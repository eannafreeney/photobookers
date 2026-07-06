import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator.js";
import { sendBOTDCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema.js";
import { capitalize } from "../../../../../utils.js";
import {
  executeBOTDEmail,
  requireCreatorEmailOrRenderModal
} from "../../../../../features/dashboard/admin/planner/emailFlow.js";
import { buildBotdEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders.js";
import { renderPlannerEmailSuccess } from "../../../../../features/dashboard/admin/planner/renderPlannerEmailSuccess.js";
import EmailStatusBadge from "../../../../../features/dashboard/admin/planner/components/EmailStatusBadge.js";
import { formatBotdDateLong } from "../../../../../features/dashboard/admin/planner/utils.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { getBookOfTheDayForDateQuery } from "../../../../../features/dashboard/admin/planner/services.js";
import { sendManualBotdEmail } from "../../../../../features/dashboard/admin/planner/botdEmailServices.js";
import { normalizeStoredDate, toUtcStartOfDay } from "../../../../../lib/utils.js";
const POST = createRoute(
  formValidator(sendBOTDCreatorEmailFormSchema),
  async (c) => {
    const { bookId, creatorId, date, recipientType, emailKind } = c.req.valid("form");
    const [botdErr, botdRow] = await getBookOfTheDayForDateQuery(date);
    if (botdErr || !botdRow)
      return showErrorAlert(c, "Book of the day not found");
    const botdDay = toUtcStartOfDay(normalizeStoredDate(date));
    const botdDateLabel = formatBotdDateLong(botdDay);
    const badge = buildBotdEmailBadgeProps({
      bookOfTheDay: botdRow,
      recipientType,
      emailKind
    });
    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      bookId,
      recipientType,
      date: botdDay,
      action: "/dashboard/admin/planner/book-of-the-day/set-send-email",
      title: `Email ${capitalize(recipientType)} \u2014 Book of the Day on ${botdDateLabel}`,
      targetId: badge.targetId,
      fallbackTargetNode: /* @__PURE__ */ jsx(EmailStatusBadge, { ...badge })
    });
    if (response || !creator) return response;
    if (emailKind === "advance") {
      return executeBOTDEmail({
        c,
        creator,
        date: botdDay,
        recipientType,
        bookId,
        badge
      });
    }
    const [sendError, updatedBotd] = await sendManualBotdEmail(
      botdDay,
      recipientType,
      emailKind
    );
    if (sendError) return showErrorAlert(c, sendError.reason);
    if (!updatedBotd) return showErrorAlert(c, "Book of the day not found");
    const updatedBadge = buildBotdEmailBadgeProps({
      bookOfTheDay: updatedBotd,
      recipientType,
      emailKind
    });
    return renderPlannerEmailSuccess(c, creator, {
      ...updatedBadge,
      hasEmail: true
    });
  }
);
export {
  POST
};
