import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { markAllAdminNotificationsRead } from "../../../../features/dashboard/admin/notifications/services.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
const POST = createRoute(async (c) => {
  const [error] = await markAllAdminNotificationsRead();
  if (error) return showErrorAlert(c, error.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "All notifications marked as read." }),
      dispatchEvents(["admin-notifications:updated"])
    ] })
  );
});
export {
  POST
};
