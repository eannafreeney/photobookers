import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import {
  executeBOTDEmail,
  updateCreatorEmailOrError,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { buildBotdEmailBadgeProps } from "../../../../../features/dashboard/admin/planner/emailBadgeBuilders";
import { getBookOfTheDayForDateQuery } from "../../../../../features/dashboard/admin/planner/services";
import { normalizeStoredDate, toUtcStartOfDay } from "../../../../../lib/utils";

export const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const { creatorId, email, bookId, date, recipientType } =
      c.req.valid("form");
    if (!bookId || !recipientType || !date)
      return showErrorAlert(c, "Invalid email payload");

    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email,
    });
    if (response || !creator) return response!;

    const botdDay = toUtcStartOfDay(normalizeStoredDate(date));
    const [botdErr, botdRow] = await getBookOfTheDayForDateQuery(botdDay);
    if (botdErr || !botdRow)
      return showErrorAlert(c, "Book of the day not found");

    const badge = buildBotdEmailBadgeProps({
      bookOfTheDay: botdRow,
      recipientType,
      emailKind: "advance",
    });

    return executeBOTDEmail({
      c,
      creator,
      date: botdDay,
      recipientType,
      bookId,
      badge,
    });
  },
);
