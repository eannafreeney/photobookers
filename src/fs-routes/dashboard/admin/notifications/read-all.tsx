import { createRoute } from "hono-fsr";
import { markAllAdminNotificationsRead } from "../../../../features/dashboard/admin/notifications/services";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import { dispatchEvents } from "../../../../lib/disatchEvents";

export const POST = createRoute(async (c) => {
  const [error] = await markAllAdminNotificationsRead();
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert type="success" message="All notifications marked as read." />
      {dispatchEvents(["admin-notifications:updated"])}
    </>,
  );
});
