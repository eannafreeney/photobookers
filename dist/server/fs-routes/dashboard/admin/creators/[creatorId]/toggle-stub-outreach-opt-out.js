import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import { getCreatorByIdAdmin } from "../../../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { setStubOutreachOptOut } from "../../../../../features/stub-outreach/welcomeEmail.js";
import StubOutreachStatus from "../../../../../features/dashboard/admin/creators/components/StubOutreachStatus.js";
const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");
  const optedOut = !creator.stubOutreachOptOutAt;
  const [updateError] = await setStubOutreachOptOut(creatorId, optedOut);
  if (updateError) return showErrorAlert(c, updateError.reason);
  const [refreshError, updated] = await getCreatorByIdAdmin(creatorId);
  if (refreshError || !updated) {
    return showErrorAlert(c, "Updated but failed to refresh creator");
  }
  return c.html(/* @__PURE__ */ jsx(StubOutreachStatus, { creator: updated }));
});
export {
  POST
};
