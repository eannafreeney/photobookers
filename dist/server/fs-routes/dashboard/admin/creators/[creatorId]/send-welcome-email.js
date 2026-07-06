import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import { getCreatorByIdAdmin } from "../../../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import { getUser } from "../../../../../utils.js";
import { sendStubWelcomeEmail } from "../../../../../features/stub-outreach/welcomeEmail.js";
import Alert from "../../../../../components/app/Alert.js";
import SendWelcomeEmailButton from "../../../../../features/dashboard/admin/creators/components/SendWelcomeEmailButton.js";
const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");
  if (!creator.email) return showErrorAlert(c, "Creator has no email");
  const user = await getUser(c);
  if (!user) return showErrorAlert(c, "User not found");
  const [sendError, sent] = await sendStubWelcomeEmail(creator);
  if (sendError) return showErrorAlert(c, sendError.reason);
  const [refreshError, updatedCreator] = await getCreatorByIdAdmin(creatorId);
  if (refreshError || !updatedCreator) {
    return showErrorAlert(c, "Welcome sent but failed to refresh creator");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Welcome email sent to ${creator.displayName} at ${sent.to}`
        }
      ),
      /* @__PURE__ */ jsx(SendWelcomeEmailButton, { creator: updatedCreator })
    ] })
  );
});
export {
  POST
};
