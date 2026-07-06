import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator } from "../../../../lib/validator.js";
import { deleteMultipleUsersSchema } from "../../../../features/dashboard/admin/users/schema.js";
import { deleteUserByIdAdmin } from "../../../../features/dashboard/admin/users/services.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
const POST = createRoute(
  formValidator(deleteMultipleUsersSchema),
  async (c) => {
    const { ids } = c.req.valid("form");
    const results = await Promise.all(ids.map((id) => deleteUserByIdAdmin(id)));
    const deleted = results.filter(Boolean).length;
    if (deleted !== ids.length)
      return showErrorAlert(c, "Failed to delete users");
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: `${deleted} user(s) deleted.` }),
        dispatchEvents(["users:updated"])
      ] })
    );
  }
);
export {
  POST
};
