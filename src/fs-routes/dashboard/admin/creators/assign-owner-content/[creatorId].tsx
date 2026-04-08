import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import { getAllUserProfilesAdmin } from "../../../../../features/dashboard/admin/creators/services";
import AssignOwnerModalContent from "../../../../../features/dashboard/admin/creators/components/AssignOwnerModalContent";
import { showErrorAlert } from "../../../../../lib/alertHelpers";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, users] = await getAllUserProfilesAdmin();
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <AssignOwnerModalContent users={users} creatorId={creatorId} />,
  );
});
