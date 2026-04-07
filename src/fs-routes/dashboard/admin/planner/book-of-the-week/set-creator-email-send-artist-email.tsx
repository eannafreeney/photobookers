import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { setCreatorEmailSendArtistEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { updateCreatorEmail } from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { sendBookOfTheWeekArtistEmail } from "../../../../../features/dashboard/admin/planner/utils";

export const POST = createRoute(
  formValidator(setCreatorEmailSendArtistEmailFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const { creatorId, email, bookId } = form;

    const [updateError, updatedCreator] = await updateCreatorEmail(
      creatorId,
      email,
    );

    if (updateError || !updatedCreator)
      return showErrorAlert(c, "Failed to update creator email");
    if (!updatedCreator.email)
      return showErrorAlert(c, "Failed to update creator email");

    return sendBookOfTheWeekArtistEmail(
      c,
      { displayName: updatedCreator.displayName, email: updatedCreator.email },
      bookId,
    );
  },
);
