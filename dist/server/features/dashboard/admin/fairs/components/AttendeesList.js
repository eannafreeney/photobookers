import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormDelete from "../../../../../components/forms/FormDelete.js";
import StatusPill from "../../components/StatusPill.js";
import Button from "../../../../../components/app/Button.js";
const AttendeesList = ({ attendees, fairId }) => {
  if (attendees.length === 0) {
    return /* @__PURE__ */ jsx("div", { class: "text-center py-8 text-gray-500", children: "No attendees yet. Add creators above." });
  }
  return /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: attendees.map((attendee) => /* @__PURE__ */ jsxs(
    "div",
    {
      class: "border rounded-lg p-4 flex flex-col gap-3",
      "x-data": true,
      children: [
        /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3 min-w-0", children: [
            attendee.creator.coverUrl && /* @__PURE__ */ jsx(
              "img",
              {
                src: attendee.creator.coverUrl,
                alt: attendee.creator.displayName,
                class: "w-12 h-12 rounded-full object-cover flex-shrink-0"
              }
            ),
            /* @__PURE__ */ jsxs("div", { class: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { class: "font-medium truncate", children: attendee.creator.displayName }),
              /* @__PURE__ */ jsx("div", { class: "text-sm text-gray-500 capitalize", children: attendee.creator.type })
            ] })
          ] }),
          /* @__PURE__ */ jsx(StatusPill, { status: attendee.status })
        ] }),
        /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
          attendee.status === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "form",
              {
                method: "post",
                action: `/dashboard/admin/fairs/${fairId}/attendees/${attendee.id}/approve`,
                "x-target": "attendees-list",
                children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "success", children: "Approve" })
              }
            ),
            /* @__PURE__ */ jsx(
              "form",
              {
                method: "post",
                action: `/dashboard/admin/fairs/${fairId}/attendees/${attendee.id}/reject`,
                "x-target": "attendees-list",
                children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "danger", children: "Reject" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            FormDelete,
            {
              action: `/dashboard/admin/fairs/${fairId}/attendees?creatorId=${attendee.creatorId}`,
              ...{ "@ajax:success": "$el.closest('[x-data]').remove()" },
              children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", width: "fit", children: "Remove" })
            }
          )
        ] })
      ]
    },
    attendee.id
  )) });
};
var AttendeesList_default = AttendeesList;
export {
  AttendeesList_default as default
};
