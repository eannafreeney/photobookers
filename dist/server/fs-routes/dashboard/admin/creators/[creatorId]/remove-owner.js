import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { creatorIdSchema } from "../../../../../schemas/index.js";
import { removeCreatorOwnerAdminDB } from "../../../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import OwnerCell from "../../../../../features/dashboard/admin/creators/components/OwnerCell.js";
const POST = createRoute(
  paramValidator(creatorIdSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const [error, creator] = await removeCreatorOwnerAdminDB(creatorId);
    if (error || !creator)
      return showErrorAlert(c, "Failed to remove creator owner");
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: "success",
            message: `user removed as owner of creator: ${creator.displayName}`
          }
        ),
        /* @__PURE__ */ jsx(OwnerCell, { ownerUserId: null, creatorId })
      ] })
    );
  }
);
export {
  POST
};
