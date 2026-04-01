import { Context } from "hono";
import { getUser } from "../../../../utils";
import NotificationsPageAdmin from "./pages/NotificationsPageAdmin";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import Alert from "../../../../components/app/Alert";
import {
  getUnreadAdminNotificationsCount,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from "./services";
import { showErrorAlert } from "../../../../lib/alertHelpers";

const updateNotificationsPage = () => "admin-notifications:updated";
const updateNotificationsBadge = () => "admin-notifications-badge:updated";

export const getNotificationsPageAdmin = async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  return c.html(
    <NotificationsPageAdmin
      user={user}
      currentPath={currentPath}
      currentPage={currentPage}
    />,
  );
};

export const markAllNotificationsReadAdmin = async (c: Context) => {
  const [error] = await markAllAdminNotificationsRead();
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert type="success" message="All notifications marked as read." />
      {dispatchEvents([updateNotificationsPage()])}
    </>,
  );
};
// keep JSON for badge fetch
export const getUnreadNotificationsCountAdmin = async (c: Context) => {
  const [error, count] = await getUnreadAdminNotificationsCount();
  if (error) return c.json({ count: 0 }, 500);
  return c.json({ count });
};

export const markNotificationReadAdmin = async (c: Context) => {
  const id = c.req.param("notificationId");
  const [error] = await markAdminNotificationRead(id);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert type="success" message="Notification marked as read." />
      {dispatchEvents([updateNotificationsPage(), updateNotificationsBadge()])}
    </>,
  );
};
