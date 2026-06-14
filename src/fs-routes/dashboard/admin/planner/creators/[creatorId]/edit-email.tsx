import { createRoute } from "hono-fsr";
import {
  formValidator,
  paramValidator,
} from "../../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../../schemas";
import { updateCreatorEmailFormSchema } from "../../../../../../features/dashboard/admin/planner/schema";
import { getCreatorEmailById } from "../../../../../../features/dashboard/creators/services";
import { updateCreatorEmailOrError } from "../../../../../../features/dashboard/admin/planner/emailFlow";
import EditCreatorEmailModal from "../../../../../../features/dashboard/admin/planner/modals/EditCreatorEmailModal";
import CreatorEmailBadge from "../../../../../../features/dashboard/admin/planner/components/CreatorEmailBadge";
import Modal from "../../../../../../components/app/Modal";
import Alert from "../../../../../../components/app/Alert";
import { showErrorAlert } from "../../../../../../lib/alertHelpers";
import { dispatchEvents } from "../../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorEmailById(creatorId);
  if (error || !creator) return showErrorAlert(c, "Creator not found");

  return c.html(
    <Modal title={`${creator.displayName} — email`}>
      <EditCreatorEmailModal
        creatorId={creator.id}
        displayName={creator.displayName}
        email={creator.email}
      />
    </Modal>,
  );
});

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(updateCreatorEmailFormSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const { email } = c.req.valid("form");

    const { response, creator } = await updateCreatorEmailOrError(c, {
      creatorId,
      email,
    });
    if (response || !creator) return response!;

    return c.html(
      <>
        <Alert
          type="success"
          message={`Email saved for ${creator.displayName}`}
        />
        <CreatorEmailBadge creatorId={creator.id} email={creator.email} />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
