import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { updateCreatorEmail } from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { setEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { dispatchEvents } from "../../../../../lib/disatchEvents";
import Alert from "../../../../../components/app/Alert";
import { updatePublisherOfTheWeekByWeekStart } from "../../../../../features/dashboard/admin/planner/services";

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

    // const html = generateBOTWNotificationEmail(creator, book);
    // const [emailError] = await sendEmail(
    //   creator.email,
    //   `Congrats! You are Artist of the Week at photobookers`,
    //   html,
    // );
    // if (emailError) return showErrorAlert(c, emailError.reason);

    const [updatePOTWError, updatedPublisherOfTheWeek] =
      await updatePublisherOfTheWeekByWeekStart(weekStart);
    if (updatePOTWError) return showErrorAlert(c, updatePOTWError.reason);

    return c.html(
      <>
        <Alert type="success" message="Email Sent" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
