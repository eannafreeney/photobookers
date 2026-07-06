import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import { normalizeStoredDate } from "../../../../../lib/utils.js";
import ToggleButton from "./ToggleButton.js";
import {
  formatDayLabel,
  getEmailSendStatus
} from "../utils.js";
const EmailStatusBadge = ({
  label,
  sentAt,
  scheduledDate,
  hasEmail,
  targetId,
  manualSend
}) => {
  const normalizedSentAt = sentAt ? normalizeStoredDate(sentAt) : null;
  const status = getEmailSendStatus({
    sentAt: normalizedSentAt,
    scheduledDate,
    hasEmail
  });
  const detail = getDetail(status, normalizedSentAt, scheduledDate);
  const showManualSend = status === "overdue" && manualSend && hasEmail && (!manualSend.requiresAdvanceSent || manualSend.advanceSent);
  const badge = /* @__PURE__ */ jsxs(
    "span",
    {
      title: detail,
      class: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusClasses[status]}`,
      children: [
        statusIcon[status],
        /* @__PURE__ */ jsx("span", { children: label }),
        /* @__PURE__ */ jsx("span", { class: "opacity-80", children: "\xB7" }),
        /* @__PURE__ */ jsx("span", { class: "opacity-90", children: detail })
      ]
    }
  );
  if (!showManualSend) {
    return /* @__PURE__ */ jsx("div", { id: targetId, children: badge });
  }
  const alpineAttrs = {
    "x-target": `${targetId} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:success": "$dispatch('planner:updated')",
    "x-on:ajax:error": "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false"
  };
  return /* @__PURE__ */ jsxs("div", { id: targetId, class: "flex items-center justify-between", children: [
    badge,
    /* @__PURE__ */ jsxs(FormPost, { action: manualSend.action, ...alpineAttrs, className: "inline", children: [
      Object.entries(manualSend.fields).map(([name, value]) => /* @__PURE__ */ jsx("input", { type: "hidden", name, value }, name)),
      /* @__PURE__ */ jsx(ToggleButton, { isSent: false, compact: true, title: "Send overdue email now" })
    ] })
  ] });
};
var EmailStatusBadge_default = EmailStatusBadge;
function getDetail(status, sentAt, scheduledDate) {
  switch (status) {
    case "sent":
      return sentAt ? `Sent ${formatDayLabel(sentAt)}` : "Sent";
    case "today":
      return "Sends today";
    case "pending":
      return `Sends ${formatDayLabel(scheduledDate)}`;
    case "overdue":
      return `Overdue \xB7 ${formatDayLabel(scheduledDate)}`;
    case "blocked":
      return "Needs email";
  }
}
const statusClasses = {
  sent: "border-success bg-success/10 text-success",
  pending: "border-outline bg-surface-alt text-on-surface",
  today: "border-info bg-info/10 text-info",
  overdue: "border-warning bg-warning/10 text-warning",
  blocked: "border-danger bg-danger/10 text-danger"
};
const checkIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-3.5 shrink-0",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "fill-rule": "evenodd",
        d: "M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",
        "clip-rule": "evenodd"
      }
    )
  }
);
const calendarIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-3.5 shrink-0",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3H5.25ZM4.5 8.5h11v6.25a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V8.5Z" })
  }
);
const warningIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-3.5 shrink-0",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "fill-rule": "evenodd",
        d: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
        "clip-rule": "evenodd"
      }
    )
  }
);
const crossIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-3.5 shrink-0",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" })
  }
);
const statusIcon = {
  sent: checkIcon,
  pending: calendarIcon,
  today: calendarIcon,
  overdue: warningIcon,
  blocked: crossIcon
};
export {
  EmailStatusBadge_default as default
};
