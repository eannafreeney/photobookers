import ToastContainer from "./ToastContainer";
import { type AlertType, alertVariants, toastIconSvgs } from "../../lib/toastVariants";

export { alertVariants };

interface AlertProps {
  type: AlertType;
  message: string;
}

const Alert = ({ type, message }: AlertProps) => {
  return (
    <ToastContainer>
      <Toast type={type} message={message} />
    </ToastContainer>
  );
};

export default Alert;

interface ToastProps {
  type: AlertType;
  message: string;
}

const Toast = ({ type, message }: ToastProps) => {
  const variant = alertVariants[type];

  const alpineAttrs = {
    "x-data": "alert",
    "x-show": "show",
    "x-transition.duration.500ms": "",
  };
  return (
    <li
      {...alpineAttrs}
      class={`overflow-hidden rounded-sm border
          bg-surface text-on-surface
          ${variant.border}
          `}
    >
      <div class={`flex w-full items-center gap-2 p-2 ${variant.bg}`}>
        <div
          class={`rounded-full p-1 ${variant.iconWrapper}`}
          dangerouslySetInnerHTML={{ __html: toastIconSvgs[type] }}
        />
        <p class="text-xs font-medium sm:text-sm">{message}</p>
        <button class="ml-auto cursor-pointer" x-on:click="dismiss()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            stroke="currentColor"
            fill="none"
            stroke-width="2.5"
            class="size-4 shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </li>
  );
};
