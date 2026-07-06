import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Table from "../../../../../components/app/Table.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
import Link from "../../../../../components/app/Link.js";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll.js";
import { formatDate } from "../../../../../utils.js";
import { getAdminNotifications } from "../services.js";
import Button from "../../../../../components/app/Button.js";
const NotificationsTableAdmin = async ({ currentPath, currentPage }) => {
  const [error, result] = await getAdminNotifications(currentPage);
  if (error) return /* @__PURE__ */ jsxs("div", { children: [
    "Error: ",
    error.reason
  ] });
  if (!result?.notifications) return /* @__PURE__ */ jsx("div", { children: "No notifications found" });
  const { notifications, totalPages, page } = result;
  const targetId = "notifications-table-body";
  const alpineAttrs = {
    "x-init": "true",
    "@admin-notifications:updated.window": "$ajax('/dashboard/admin/notifications', { target: 'notifications-table-container' })"
  };
  return /* @__PURE__ */ jsxs("div", { id: "notifications-table-container", class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx(SectionTitle, { children: "Notifications" }),
    /* @__PURE__ */ jsx(MarkAllNotificationsReadButton, {}),
    /* @__PURE__ */ jsxs(Table, { id: "notifications-table", children: [
      /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Message" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Date" }),
        /* @__PURE__ */ jsx(Table.HeadRow, { children: "Link" })
      ] }) }),
      /* @__PURE__ */ jsx(Table.Body, { id: targetId, xMerge: "append", ...alpineAttrs, children: notifications.map((n) => /* @__PURE__ */ jsxs(
        "tr",
        {
          "data-notification-id": n.id,
          "data-read": n.isRead ? "true" : "false",
          class: n.isRead ? "bg-green-50" : "bg-red-50",
          children: [
            /* @__PURE__ */ jsx(Table.BodyRow, { children: n.title }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: n.body }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: n.createdAt ? formatDate(n.createdAt) : "" }),
            /* @__PURE__ */ jsx(Table.BodyRow, { children: n.targetUrl ? /* @__PURE__ */ jsx(Link, { href: n.targetUrl, target: "_blank", children: "Open" }) : "-" })
          ]
        },
        n.id
      )) })
    ] }),
    /* @__PURE__ */ jsx(
      InfiniteScroll,
      {
        baseUrl: currentPath,
        page,
        totalPages,
        targetId
      }
    )
  ] });
};
var NotificationsTableAdmin_default = NotificationsTableAdmin;
const MarkAllNotificationsReadButton = () => /* @__PURE__ */ jsx(
  "form",
  {
    action: "/dashboard/admin/notifications/read-all",
    method: "post",
    "x-target": "toast",
    children: /* @__PURE__ */ jsx(Button, { type: "submit", variant: "outline", color: "primary", children: "Mark all as read" })
  }
);
export {
  NotificationsTableAdmin_default as default
};
