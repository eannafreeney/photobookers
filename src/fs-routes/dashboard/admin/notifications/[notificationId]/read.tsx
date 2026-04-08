import { createRoute } from "hono-fsr";
import { markAdminNotificationRead } from "../../../../../features/dashboard/admin/notifications/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const POST = createRoute(async (c) => {
  const id = c.req.param("notificationId");
  if (!id) return showErrorAlert(c, "Notification ID is required");
  const [error] = await markAdminNotificationRead(id);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert type="success" message="Notification marked as read." />
      {dispatchEvents([
        "admin-notifications:updated",
        "admin-notifications-badge:updated",
      ])}
    </>,
  );
});
