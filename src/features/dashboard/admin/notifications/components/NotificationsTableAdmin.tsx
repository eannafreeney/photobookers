import Table from "../../../../../components/app/Table";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Link from "../../../../../components/app/Link";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";
import { formatDate } from "../../../../../utils";
import { getAdminNotifications } from "../services";

type Props = {
  currentPath: string;
  currentPage: number;
};

const NotificationsTableAdmin = async ({ currentPath, currentPage }: Props) => {
  const [error, result] = await getAdminNotifications(currentPage);

  if (error) return <div>Error: {error.reason}</div>;

  if (!result?.notifications) return <div>No notifications found</div>;

  const { notifications, totalPages, page } = result;
  const targetId = "notifications-table-body";

  const alpineAttrs = {
    "x-init": "true",
    "@admin-notifications:updated.window":
      "$ajax('/dashboard/admin/notifications', { target: 'notifications-table-container' })",
  };

  return (
    <div
      id="notifications-table-container"
      class="flex flex-col gap-4"
      x-data="adminNotificationsTable"
      x-init="init()"
    >
      <SectionTitle>Notifications</SectionTitle>
      <MarkAllNotificationsReadButton />
      <Table id="notifications-table">
        <Table.Head>
          <tr>
            <Table.HeadRow>Title</Table.HeadRow>
            <Table.HeadRow>Message</Table.HeadRow>
            <Table.HeadRow>Date</Table.HeadRow>
            <Table.HeadRow>Link</Table.HeadRow>
          </tr>
        </Table.Head>

        <Table.Body id={targetId} xMerge="append" {...alpineAttrs}>
          {notifications.map((n) => (
            <tr
              key={n.id}
              data-notification-id={n.id}
              data-read={n.isRead ? "true" : "false"}
              class={n.isRead ? "bg-green-50" : "bg-red-50"}
            >
              <Table.BodyRow>{n.title}</Table.BodyRow>
              <Table.BodyRow>{n.body}</Table.BodyRow>
              <Table.BodyRow>
                {n.createdAt ? formatDate(n.createdAt) : ""}
              </Table.BodyRow>
              <Table.BodyRow>
                {n.targetUrl ? (
                  <Link href={`/dashboard/admin${n.targetUrl}`}>Open</Link>
                ) : (
                  "-"
                )}
              </Table.BodyRow>
            </tr>
          ))}
        </Table.Body>
      </Table>
      <InfiniteScroll
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </div>
  );
};

export default NotificationsTableAdmin;

const MarkAllNotificationsReadButton = () => (
  <form
    action="/dashboard/admin/notifications/read-all"
    method="post"
    x-target="toast"
  >
    <button type="submit" class="text-sm underline cursor-pointer">
      Mark all as read
    </button>
  </form>
);
