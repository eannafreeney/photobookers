import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import {
  getCreatorByIdAdmin,
  verifyCreatorAdmin,
} from "../../../../../features/dashboard/admin/creators/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import VerifyCreatorButton from "../../../../../features/dashboard/admin/creators/components/VerifyCreatorButton";

export const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");

  const [verifyError, verifiedCreator] = await verifyCreatorAdmin(creatorId);
  if (verifyError) return showErrorAlert(c, verifyError.reason);

  return c.html(
    <>
      <Alert
        type="success"
        message={`${verifiedCreator.displayName} is now verified`}
      />
      <VerifyCreatorButton creator={verifiedCreator} />
    </>,
  );
});
