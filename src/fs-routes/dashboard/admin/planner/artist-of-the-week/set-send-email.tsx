import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { updateCreatorEmail } from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { dispatchEvents } from "../../../../../lib/disatchEvents";
import Alert from "../../../../../components/app/Alert";
import { updateArtistOfTheWeekByWeekStart } from "../../../../../features/dashboard/admin/planner/services";
import { buildAOTWNotificationEmail } from "../../../../../features/dashboard/admin/planner/emails";
import { sendEmail } from "../../../../../lib/sendEmail";

export const POST = createRoute(
  formValidator(setEmailFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const { creatorId, email, weekStart } = form;

    const [updateError, updatedCreator] = await updateCreatorEmail(
      creatorId,
      email,
    );

    if (updateError || !updatedCreator)
      return showErrorAlert(c, "Failed to update creator email");
    if (!updatedCreator.email)
      return showErrorAlert(c, "Failed to update creator email");

    const html = buildAOTWNotificationEmail(updatedCreator);
    const [emailError] = await sendEmail(
      updatedCreator.email,
      `Congrats! You are Artist of the Week at photobookers`,
      html,
    );
    if (emailError) return showErrorAlert(c, emailError.reason);

    const [updateAOTWError] = await updateArtistOfTheWeekByWeekStart(weekStart);
    if (updateAOTWError) return showErrorAlert(c, updateAOTWError.reason);

    return c.html(
      <>
        <Alert type="success" message="Email Sent" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
