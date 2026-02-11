import { fadeTransition } from "../../lib/transitions";

type AlertType = keyof typeof alertVariants;

interface AlertProps {
  type: AlertType;
  message: string;
}

const Alert = ({ type, message }: AlertProps) => {
  const variant = alertVariants[type];

  const alpineAttrs = {
    "x-data": "{ show: false }",
    "x-init":
      "$nextTick(() => show = true); setTimeout(() => { show = false; setTimeout(() => $el.remove(), 300) }, 4000)",
    "x-show": "show",
  };

  return (
    <div
      id="toast"
      x-sync
      {...alpineAttrs}
      {...fadeTransition}
      class={`fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50 overflow-hidden rounded-sm border
        bg-surface text-on-surface
        ${variant.border}`}
    >
      <div class={`flex w-full items-center gap-2 p-4 ${variant.bg}`}>
        <div
          aria-hidden="true"
          class={`rounded-full p-1 ${variant.iconWrapper}`}
        >
          {variant.Icon}
        </div>

        <div class="ml-2">
          <h3 class={`text-sm font-semibold ${variant.class}`}>
            {variant.title}
          </h3>
          <p class="text-xs font-medium sm:text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;

const warningIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="size-6"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      clipRule="evenodd"
    />
  </svg>
);

const infoIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="size-6"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-3a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      clipRule="evenodd"
    />
  </svg>
);

const successIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="size-6"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
      clipRule="evenodd"
    />
  </svg>
);

const dangerIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="size-6"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
      clipRule="evenodd"
    />
  </svg>
);

const neutralIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="size-6"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-3.5-8.75a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7Z"
      clipRule="evenodd"
    />
  </svg>
);

export const alertVariants = {
  info: {
    border: "border-sky-700",
    bg: "bg-info/10",
    iconWrapper: "bg-sky-700/15 text-sky-700",
    class: "text-info",
    Icon: infoIcon,
    title: "Info",
  },
  success: {
    border: "border-green-700",
    bg: "bg-success/5",
    iconWrapper: "bg-green-700/15 text-green-700",
    class: "text-success",
    Icon: successIcon,
    title: "Success",
  },
  warning: {
    border: "border-amber-600",
    bg: "bg-warning/10",
    iconWrapper: "bg-amber-600/15 text-amber-600",
    class: "text-warning",
    Icon: warningIcon,
    title: "Warning",
  },
  danger: {
    border: "border-red-700",
    bg: "bg-danger/10",
    iconWrapper: "bg-red-700/15 text-red-700",
    class: "text-danger",
    Icon: dangerIcon,
    title: "Error",
  },
  neutral: {
    border: "border-slate-400",
    bg: "bg-slate-500/10 ",
    iconWrapper: "bg-slate-500/15 text-slate-600 ",
    class: "text-slate-700",
    Icon: neutralIcon,
    title: "Note",
  },
} as const;
