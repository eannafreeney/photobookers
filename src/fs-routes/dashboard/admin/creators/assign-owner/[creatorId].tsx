import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import { creatorIdSchema } from "../../../../../schemas";
import { getCreatorByIdAdmin } from "../../../../../features/dashboard/admin/creators/services";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../lib/alertHelpers";
import AssignOwnerModal from "../../../../../features/dashboard/admin/creators/modals/AssignOwnerModal";
import { manualAssignCreatorSchema } from "../../../../../features/dashboard/admin/creators/schemas";
import { assignUserAsCreatorOwnerAdmin } from "../../../../../features/dashboard/admin/claims/services";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");

  return c.html(
    <AssignOwnerModal
      creatorName={creator.displayName ?? "this creator"}
      creatorId={creatorId}
    />,
  );
});

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(manualAssignCreatorSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const userId = c.req.valid("form").userId;

    const [error] = await assignUserAsCreatorOwnerAdmin(userId, creatorId);
    if (error) return showErrorAlert(c, error.reason);

    return showSuccessAlert(c, "Creator assigned!");
  },
);
