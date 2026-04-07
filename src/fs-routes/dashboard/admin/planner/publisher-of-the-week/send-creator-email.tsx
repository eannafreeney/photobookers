import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendPOTWCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getCreatorEmailById } from "../../../../../features/dashboard/creators/services";
import Modal from "../../../../../components/app/Modal";
import SetCreatorEmailModal from "../../../../../features/dashboard/admin/planner/modals/SetCreatorEmailModal";
import { updatePublisherOfTheWeekByWeekStart } from "../../../../../features/dashboard/admin/planner/services";
import Alert from "../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../lib/disatchEvents";
import SendPOTWCreatorEmailButton from "../../../../../features/dashboard/admin/planner/components/SendPOTWCreatorEmailButton";

export const POST = createRoute(
  formValidator(sendPOTWCreatorEmailFormSchema),
  async (c) => {
    const creatorId = c.req.valid("form").creatorId;
    const weekStart = c.req.valid("form").weekStart;

    const [err, creator] = await getCreatorEmailById(creatorId);
    if (err || !creator) return showErrorAlert(c, "Creator not found");

    if (!creator.email)
      return c.html(
        <Modal title={`Send Artist Email`}>
          <SetCreatorEmailModal
            creatorId={creatorId}
            weekStart={weekStart}
            action={`/dashboard/admin/planner/publisher-of-the-week/set-send-email`}
          />
        </Modal>,
      );

    // const html = generateBOTWNotificationEmail(creator, book);
    // const [emailError] = await sendEmail(
    //   creator.email,
    //   `Congrats! You are Artist of the Week at photobookers`,
    //   html,
    // );
    // if (emailError) return showErrorAlert(c, emailError.reason);

    const [updateError, updatedPublisherOfTheWeek] =
      await updatePublisherOfTheWeekByWeekStart(weekStart);
    if (updateError) return showErrorAlert(c, updateError.reason);

    return c.html(
      <>
        <Alert type="success" message="Email Sent" />
        <SendPOTWCreatorEmailButton
          publisherOfTheWeek={updatedPublisherOfTheWeek}
          creatorId={creatorId}
        />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
