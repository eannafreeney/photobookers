import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { updateCreatorEmail } from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { sendBookOfTheWeekCreatorEmail } from "../../../../../features/dashboard/admin/planner/utils";
import { toWeekString } from "../../../../../lib/utils";
import { setSendEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";

export const POST = createRoute(
  formValidator(setSendEmailFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const { creatorId, email, bookId, weekStart, recipientType } = form;

    const [updateError, updatedCreator] = await updateCreatorEmail(
      creatorId,
      email,
    );

    if (updateError || !updatedCreator)
      return showErrorAlert(c, "Failed to update creator email");
    if (!updatedCreator.email)
      return showErrorAlert(c, "Failed to update creator email");

    return sendBookOfTheWeekCreatorEmail(
      c,
      {
        displayName: updatedCreator.displayName,
        email: updatedCreator.email,
        id: updatedCreator.id,
        type: updatedCreator.type,
      },
      toWeekString(weekStart),
      recipientType,
      bookId,
    );
  },
);
