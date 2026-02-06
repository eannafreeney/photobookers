import { PropsWithChildren } from "hono/jsx";


const Modal = ({ children }: PropsWithChildren) => {
  return (
    <dialog
      id="modal-root"
      class="modal z-1 "
      x-data
      x-effect="$el.showModal()"
      {...{ "x-on:dialog:close": "$el.close()" }}
    >
      <div class="modal-box bg-surface-alt rounded-radius">
        <form method="dialog">
          <button
            class="btn btn-sm btn-circle btn-ghost cursor-pointer absolute right-2 top-2"
            aria-label="Close"
          >
            <CloseButton />
          </button>
        </form>
        {children}
      </div>
    </dialog>
  );
};

export default Modal;

const CloseButton = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="size-6"
    >
      <path
        fill-rule="evenodd"
        d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
        clip-rule="evenodd"
      />
    </svg>
  );
};
