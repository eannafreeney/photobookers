import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import { removeCreatorOwnerAdminDB } from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import OwnerCell from "../../../../../features/dashboard/admin/creators/components/OwnerCell";

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const [error, creator] = await removeCreatorOwnerAdminDB(creatorId);
    if (error || !creator)
      return showErrorAlert(c, "Failed to remove creator owner");

    return c.html(
      <>
        <Alert
          type="success"
          message={`user removed as owner of creator: ${creator.displayName}`}
        />
        <OwnerCell ownerUserId={null} creatorId={creatorId} />
      </>,
    );
  },
);
