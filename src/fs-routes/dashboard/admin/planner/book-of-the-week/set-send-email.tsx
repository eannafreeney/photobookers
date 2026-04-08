import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import {
  executeBOTWEmail,
  updateCreatorEmailOrError,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";

export const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const { creatorId, email, bookId, weekStart, recipientType } =
      c.req.valid("form");
    if (!bookId || !recipientType)
      return showErrorAlert(c, "Invalid email payload");
    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email,
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
