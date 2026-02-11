import { alertVariants } from "./Alert";

type AlertType = keyof typeof alertVariants;

interface AlertProps {
  type: AlertType;
  message: string;
}
const AlertStatic = ({ type, message }: AlertProps) => {
  const variant = alertVariants[type];
  return (
    <div
      id="toast"
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

export default AlertStatic;
