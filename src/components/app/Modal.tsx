import clsx from "clsx";
import { PropsWithChildren } from "hono/jsx";

const MODAL_TITLE_ID = "modal-title";

const overlayAlpineAttrs = {
  "x-data": "{ modalIsOpen: true }",
  "x-cloak": true,
  "x-show": "modalIsOpen",
  "x-transition:enter": "transition ease-out duration-200",
  "x-transition:enter-start": "opacity-0",
  "x-transition:enter-end": "opacity-100",
  "x-transition:leave": "transition ease-in duration-200",
  "x-transition:leave-start": "opacity-100",
  "x-transition:leave-end": "opacity-0",
  "x-trap.inert.noscroll": "modalIsOpen",
  "x-on:keydown.esc.window": "modalIsOpen = false",
  "x-on:click.self": "modalIsOpen = false",
  "@dialog:open": "modalIsOpen = true",
  "@dialog:close.window": "modalIsOpen = false",
};

const panelAlpineAttrs = {
  "x-show": "modalIsOpen",
  "x-transition:enter":
    "transition ease-out duration-200 delay-100 motion-reduce:transition-opacity",
  "x-transition:enter-start": "opacity-0 scale-50",
  "x-transition:enter-end": "opacity-100 scale-100",
};

type ModalProps = {
  title?: string;
  /** Tailwind max-width class, e.g. "max-w-2xl" or "max-w-4xl". Defaults to "max-w-lg". */
  maxWidth?: string;
};

const Modal = ({
  children,
  title,
  maxWidth = "max-w-lg",
}: PropsWithChildren<ModalProps>) => {
  return (
    <div
      id="modal-root"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 pb-8 backdrop-blur-md sm:items-center lg:p-8"
      role="dialog"
      aria-modal="true"
      {...(title
        ? { "aria-labelledby": MODAL_TITLE_ID }
        : { "aria-label": "Dialog" })}
      {...overlayAlpineAttrs}
    >
      <div
        {...panelAlpineAttrs}
        class={clsx(
          "flex w-full flex-col gap-4 overflow-visible rounded-radius border border-outline bg-surface text-on-surface shadow-xl ",
          maxWidth,
        )}
      >
        <div class="flex items-center justify-between border-b border-outline p-4 ">
          {title ? (
            <h3
              id={MODAL_TITLE_ID}
              class="font-semibold tracking-wide text-on-surface-strong "
            >
              {title}
            </h3>
          ) : null}
          <button
            type="button"
            aria-label="Close modal"
            x-on:click="modalIsOpen = false"
            class="ml-auto text-on-surface transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>
        <div class="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    stroke="currentColor"
    fill="none"
    stroke-width="1.4"
    class="h-5 w-5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
