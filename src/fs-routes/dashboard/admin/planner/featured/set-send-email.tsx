import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import {
  executeFeaturedEmail,
  updateCreatorEmailOrError,
} from "../../../../../features/dashboard/admin/planner/emailFlow";

export const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const { creatorId, email, bookId, weekStart, recipientType } =
      c.req.valid("form");
    if (!bookId) return showErrorAlert(c, "Book is required");

    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email,
    });
    if (response || !creator) return response!;

    return executeFeaturedEmail({
      c,
      creator,
      weekStart,
      recipientType: recipientType ?? "artist",
      bookId,
    });
  },
);
