import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import {
  executeBOTDEmail,
  updateCreatorEmailOrError
} from "../../../../../features/dashboard/admin/planner/emailFlow.js";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema.js";
import { buildBotdEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders.js";
import { getBookOfTheDayForDateQuery } from "../../../../../features/dashboard/admin/planner/services.js";
import { normalizeStoredDate, toUtcStartOfDay } from "../../../../../lib/utils.js";
const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const { creatorId, email, bookId, date, recipientType } = c.req.valid("form");
    if (!bookId || !recipientType || !date)
      return showErrorAlert(c, "Invalid email payload");
    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email
    });
    if (response || !creator) return response;
    const botdDay = toUtcStartOfDay(normalizeStoredDate(date));
    const [botdErr, botdRow] = await getBookOfTheDayForDateQuery(botdDay);
    if (botdErr || !botdRow)
      return showErrorAlert(c, "Book of the day not found");
    const badge = buildBotdEmailBadgeProps({
      bookOfTheDay: botdRow,
      recipientType,
      emailKind: "advance"
    });
    return executeBOTDEmail({
      c,
      creator,
      date: botdDay,
      recipientType,
      bookId,
      badge
    });
  }
);
export {
  POST
};
