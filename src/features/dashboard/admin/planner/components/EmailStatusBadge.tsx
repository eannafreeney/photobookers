import type { Child } from "hono/jsx";
import FormPost from "../../../../../components/forms/FormPost";
import { normalizeStoredDate } from "../../../../../lib/utils";
import ToggleButton from "./ToggleButton";
import {
  formatDayLabel,
  getEmailSendStatus,
  type EmailSendStatus,
} from "../utils";

export type ManualSendConfig = {
  action: string;
  fields: Record<string, string>;
  requiresAdvanceSent?: boolean;
  advanceSent?: boolean;
};

export type EmailStatusBadgeProps = {
  label: string;
  sentAt: Date | null;
  scheduledDate: Date;
  hasEmail: boolean;
  targetId: string;
  manualSend?: ManualSendConfig;
};

const EmailStatusBadge = ({
  label,
  sentAt,
  scheduledDate,
  hasEmail,
  targetId,
  manualSend,
}: EmailStatusBadgeProps) => {
  const normalizedSentAt = sentAt ? normalizeStoredDate(sentAt) : null;
  const status = getEmailSendStatus({
    sentAt: normalizedSentAt,
    scheduledDate,
    hasEmail,
  });
  const detail = getDetail(status, normalizedSentAt, scheduledDate);
  const showManualSend =
    status === "overdue" &&
    manualSend &&
    hasEmail &&
    (!manualSend.requiresAdvanceSent || manualSend.advanceSent);

  const badge = (
    <span
      title={detail}
      class={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {statusIcon[status]}
      <span>{label}</span>
      <span class="opacity-80">·</span>
      <span class="opacity-90">{detail}</span>
    </span>
  );

  if (!showManualSend) {
    return <div id={targetId}>{badge}</div>;
  }

  const alpineAttrs = {
    "x-target": `${targetId} toast modal-root`,
    "x-target.error": "toast",
    "x-on:ajax:success": "$dispatch('planner:updated')",
    "x-on:ajax:error":
      "($el.querySelector('input[type=checkbox]') as HTMLInputElement).checked = false",
  };

  return (
    <div id={targetId} class="flex items-center justify-between">
      {badge}
      <FormPost action={manualSend.action} {...alpineAttrs} className="inline">
        {Object.entries(manualSend.fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <ToggleButton isSent={false} compact title="Send overdue email now" />
      </FormPost>
    </div>
  );
};

export default EmailStatusBadge;

function getDetail(
  status: EmailSendStatus,
  sentAt: Date | null,
  scheduledDate: Date,
): string {
  switch (status) {
    case "sent":
      return sentAt ? `Sent ${formatDayLabel(sentAt)}` : "Sent";
    case "today":
      return "Sends today";
    case "pending":
      return `Sends ${formatDayLabel(scheduledDate)}`;
    case "overdue":
      return `Overdue · ${formatDayLabel(scheduledDate)}`;
    case "blocked":
      return "Needs email";
  }
}

const statusClasses: Record<EmailSendStatus, string> = {
  sent: "border-success bg-success/10 text-success",
  pending: "border-outline bg-surface-alt text-on-surface",
  today: "border-info bg-info/10 text-info",
  overdue: "border-warning bg-warning/10 text-warning",
  blocked: "border-danger bg-danger/10 text-danger",
};

const checkIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-3.5 shrink-0"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
      clip-rule="evenodd"
    />
  </svg>
);

const calendarIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-3.5 shrink-0"
    aria-hidden="true"
  >
    <path d="M5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3H5.25ZM4.5 8.5h11v6.25a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V8.5Z" />
  </svg>
);

const warningIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-3.5 shrink-0"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      clip-rule="evenodd"
    />
  </svg>
);

const crossIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    class="size-3.5 shrink-0"
    aria-hidden="true"
  >
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);

const statusIcon: Record<EmailSendStatus, Child> = {
  sent: checkIcon,
  pending: calendarIcon,
  today: calendarIcon,
  overdue: warningIcon,
  blocked: crossIcon,
};
