import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { updateCreatorEmail } from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { sendFeaturedBookCreatorEmail } from "../../../../../features/dashboard/admin/planner/utils";
import { toWeekString } from "../../../../../lib/utils";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";

export const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const { creatorId, email, bookId, weekStart, recipientType } = form;

    if (!bookId) return showErrorAlert(c, "Book is required");

    const [updateError, updatedCreator] = await updateCreatorEmail(
      creatorId,
      email,
    );

    if (updateError || !updatedCreator)
      return showErrorAlert(c, "Failed to update creator email");
    if (!updatedCreator.email)
      return showErrorAlert(c, "Failed to update creator email");

    return sendFeaturedBookCreatorEmail(
      c,
      toWeekString(weekStart),
      recipientType ?? "artist",
      bookId,
      updatedCreator,
    );
  },
);
