import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../../lib/validator";
import { sendAOTWCreatorEmailFormSchema } from "../../../../../features/dashboard/admin/planner/schema";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getCreatorEmailById } from "../../../../../features/dashboard/creators/services";
import Modal from "../../../../../components/app/Modal";
import SetCreatorEmailModal from "../../../../../features/dashboard/admin/planner/modals/SetCreatorEmailModal";
import { updateArtistOfTheWeekByWeekStart } from "../../../../../features/dashboard/admin/planner/services";
import Alert from "../../../../../components/app/Alert";
import SendAOTWCreatorEmailButton from "../../../../../features/dashboard/admin/planner/components/SendAOTWCreatorEmailButton";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const POST = createRoute(
  formValidator(sendAOTWCreatorEmailFormSchema),
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
            action={`/dashboard/admin/planner/artist-of-the-week/set-send-email`}
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

    const [updateError, updatedArtistOfTheWeek] =
      await updateArtistOfTheWeekByWeekStart(weekStart);
    if (updateError) return showErrorAlert(c, updateError.reason);

    return c.html(
      <>
        <Alert type="success" message="Email Sent" />
        <SendAOTWCreatorEmailButton
          artistOfTheWeek={updatedArtistOfTheWeek}
          creatorId={creatorId}
        />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
