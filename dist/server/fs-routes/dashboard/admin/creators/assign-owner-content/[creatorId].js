import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import { getAllUserProfilesAdmin } from "../../../../../features/dashboard/admin/creators/services.js";
import AssignOwnerModalContent from "../../../../../features/dashboard/admin/creators/components/AssignOwnerModalContent.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, users] = await getAllUserProfilesAdmin();
  if (error) return showErrorAlert(c, error.reason);
  return c.html(
    /* @__PURE__ */ jsx(AssignOwnerModalContent, { users, creatorId })
  );
});
export {
  GET
};
