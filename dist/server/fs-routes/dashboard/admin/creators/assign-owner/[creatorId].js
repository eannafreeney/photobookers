import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import { getCreatorByIdAdmin } from "../../../../../features/dashboard/admin/creators/services.js";
import {
  showErrorAlert,
  showSuccessAlert
} from "../../../../../lib/alertHelpers.js";
import AssignOwnerModal from "../../../../../features/dashboard/admin/creators/modals/AssignOwnerModal.js";
import { manualAssignCreatorSchema } from "../../../../../features/dashboard/admin/creators/schemas.js";
import { assignUserAsCreatorOwnerAdmin } from "../../../../../features/dashboard/admin/claims/services.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");
  return c.html(
    /* @__PURE__ */ jsx(
      AssignOwnerModal,
      {
        creatorName: creator.displayName ?? "this creator",
        creatorId
      }
    )
  );
});
const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(manualAssignCreatorSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const userId = c.req.valid("form").userId;
    const [error] = await assignUserAsCreatorOwnerAdmin(userId, creatorId);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Creator assigned!");
  }
);
export {
  GET,
  POST
};
