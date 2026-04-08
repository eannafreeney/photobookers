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
import {
  executeAOTWEmail,
  plannerEmailSuccessFragment,
  requireCreatorEmailOrRenderModal,
} from "../../../../../features/dashboard/admin/planner/emailFlow";
import { buildAOTWNotificationEmail } from "../../../../../features/dashboard/admin/planner/emails";
import { sendEmail } from "../../../../../lib/sendEmail";

export const POST = createRoute(
  formValidator(sendAOTWCreatorEmailFormSchema),
  async (c) => {
    const { creatorId, weekStart } = c.req.valid("form");

    const { response, creator } = await requireCreatorEmailOrRenderModal(c, {
      creatorId,
      weekStart,
      action: `/dashboard/admin/planner/artist-of-the-week/set-send-email`,
      title: `Send Artist Email`,
    });
    if (response) return response;
    if (!creator) return showErrorAlert(c, "Creator not found");

    return executeAOTWEmail({ c, creator, creatorId, weekStart });
  },
);
