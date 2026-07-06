import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
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
  "@dialog:close.window": "modalIsOpen = false"
};
const panelAlpineAttrs = {
  "x-show": "modalIsOpen",
  "x-transition:enter": "transition ease-out duration-200 delay-100 motion-reduce:transition-opacity",
  "x-transition:enter-start": "opacity-0 scale-50",
  "x-transition:enter-end": "opacity-100 scale-100"
};
const Modal = ({
  children,
  title,
  maxWidth = "max-w-lg"
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: "modal-root",
      class: "fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 pb-8 backdrop-blur-md sm:items-center lg:p-8",
      role: "dialog",
      "aria-modal": "true",
      ...title ? { "aria-labelledby": MODAL_TITLE_ID } : { "aria-label": "Dialog" },
      ...overlayAlpineAttrs,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          ...panelAlpineAttrs,
          class: clsx(
            "flex w-full flex-col gap-4 overflow-visible rounded-radius border border-outline bg-surface text-on-surface shadow-xl ",
            maxWidth
          ),
          children: [
            /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between border-b border-outline p-4 ", children: [
              title ? /* @__PURE__ */ jsx(
                "h3",
                {
                  id: MODAL_TITLE_ID,
                  class: "font-semibold tracking-wide text-on-surface-strong ",
                  children: title
                }
              ) : null,
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  "aria-label": "Close modal",
                  "x-on:click": "modalIsOpen = false",
                  class: "ml-auto text-on-surface transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer",
                  children: /* @__PURE__ */ jsx(CloseIcon, {})
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { class: "px-4 pb-4", children })
          ]
        }
      )
    }
  );
};
var Modal_default = Modal;
const CloseIcon = () => /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    stroke: "currentColor",
    fill: "none",
    "stroke-width": "1.4",
    class: "h-5 w-5",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M6 18L18 6M6 6l12 12"
      }
    )
  }
);
export {
  Modal_default as default
};
