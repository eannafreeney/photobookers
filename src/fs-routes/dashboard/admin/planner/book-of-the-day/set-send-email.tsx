import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import {
  executeBOTDEmail,
  updateCreatorEmailOrError,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";

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
    return executeBOTDEmail({
      c,
      creator,
      date,
      recipientType,
      bookId,
    });
  },
);
