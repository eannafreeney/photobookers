import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import {
  getCreatorByIdAdmin,
  verifyCreatorAdmin
} from "../../../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import VerifyCreatorButton from "../../../../../features/dashboard/admin/creators/components/VerifyCreatorButton.js";
const POST = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const [error, creator] = await getCreatorByIdAdmin(creatorId);
  if (error || !creator) return showErrorAlert(c, "Failed to get creator");
  const [verifyError, verifiedCreator] = await verifyCreatorAdmin(creatorId);
  if (verifyError) return showErrorAlert(c, verifyError.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `${verifiedCreator.displayName} is now verified`
        }
      ),
      /* @__PURE__ */ jsx(VerifyCreatorButton, { creator: verifiedCreator })
    ] })
  );
});
export {
  POST
};
