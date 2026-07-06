import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { markAdminNotificationRead } from "../../../../../features/dashboard/admin/notifications/services.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
import Alert from "../../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../../lib/disatchEvents.js";
const POST = createRoute(async (c) => {
  const id = c.req.param("notificationId");
  if (!id) return showErrorAlert(c, "Notification ID is required");
  const [error] = await markAdminNotificationRead(id);
  if (error) return showErrorAlert(c, error.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "Notification marked as read." }),
      dispatchEvents([
        "admin-notifications:updated",
        "admin-notifications-badge:updated"
      ])
    ] })
  );
});
export {
  POST
};
