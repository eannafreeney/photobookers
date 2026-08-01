import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../components/app/Button.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import { MAX_BOOK_PRESS_LINKS } from "../pressLinks.js";
const BookPressLinksSection = () => {
  return /* @__PURE__ */ jsxs("div", { class: "md:col-span-2 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(SectionTitle, { className: "mb-0", children: "Press / reviews" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          color: "primary",
          width: "auto",
          ...{
            "x-on:click": "openPressModal()",
            "x-bind:disabled": `pressLinks.length >= ${MAX_BOOK_PRESS_LINKS}`
          },
          children: "Add press link"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface/70", children: [
      "Link to external reviews or features (max ",
      MAX_BOOK_PRESS_LINKS,
      "). Shown on the public book page."
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "hidden",
        name: "press_links",
        ...{ "x-bind:value": "form.press_links" }
      }
    ),
    /* @__PURE__ */ jsx("ul", { class: "space-y-2", ...{ "x-show": "pressLinks.length > 0" }, children: /* @__PURE__ */ jsx(
      "template",
      {
        ...{
          "x-for": "(link, index) in pressLinks",
          "x-bind:key": "index"
        },
        children: /* @__PURE__ */ jsxs("li", { class: "flex items-start justify-between gap-3 rounded-radius border border-outline bg-surface-alt p-3", children: [
          /* @__PURE__ */ jsxs("div", { class: "min-w-0 space-y-1", children: [
            /* @__PURE__ */ jsx(
              "p",
              {
                class: "font-medium text-on-surface-strong truncate",
                ...{ "x-text": "link.title" }
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                class: "text-xs text-on-surface/60 truncate",
                ...{ "x-text": "pressLinkHost(link.url)" }
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                class: "text-sm italic text-on-surface/80 line-clamp-2",
                ...{ "x-show": "link.quote", "x-text": "link.quote" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { class: "flex shrink-0 gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                class: "text-xs font-semibold uppercase tracking-wide text-accent hover:opacity-75",
                ...{ "x-on:click": "openPressModal(index)" },
                children: "Edit"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                class: "text-xs font-semibold uppercase tracking-wide text-danger hover:opacity-75",
                ...{ "x-on:click": "removePressLink(index)" },
                children: "Remove"
              }
            )
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsx(
      "p",
      {
        class: "text-sm text-on-surface/60",
        ...{ "x-show": "pressLinks.length === 0" },
        children: "No press links yet."
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        class: "fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 pb-8 backdrop-blur-md sm:items-center lg:p-8",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "press-link-modal-title",
        ...{
          "x-show": "pressModalOpen",
          "x-cloak": true,
          "x-on:keydown.esc.window": "closePressModal()",
          "x-on:click.self": "closePressModal()"
        },
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            class: "flex w-full max-w-lg flex-col gap-4 rounded-radius border border-outline bg-surface text-on-surface shadow-xl",
            ...{ "x-on:click.stop": "" },
            children: [
              /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between border-b border-outline p-4", children: [
                /* @__PURE__ */ jsx(
                  "h3",
                  {
                    id: "press-link-modal-title",
                    class: "font-semibold tracking-wide text-on-surface-strong",
                    ...{
                      "x-text": "pressEditIndex === null ? 'Add press link' : 'Edit press link'"
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    "aria-label": "Close",
                    class: "text-on-surface transition hover:opacity-75 cursor-pointer",
                    ...{ "x-on:click": "closePressModal()" },
                    children: "\xD7"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { class: "space-y-3 px-4 pb-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    "label",
                    {
                      for: "press-draft-title",
                      class: "mb-1 block text-sm font-medium",
                      children: "Outlet / title"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "press-draft-title",
                      type: "text",
                      maxlength: 120,
                      class: "w-full rounded-radius border border-outline bg-surface px-3 py-2 text-sm",
                      placeholder: "British Journal of Photography",
                      ...{ "x-model": "pressDraft.title" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    "label",
                    {
                      for: "press-draft-url",
                      class: "mb-1 block text-sm font-medium",
                      children: "URL"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "press-draft-url",
                      type: "url",
                      class: "w-full rounded-radius border border-outline bg-surface px-3 py-2 text-sm",
                      placeholder: "https://\u2026",
                      ...{ "x-model": "pressDraft.url" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    "label",
                    {
                      for: "press-draft-quote",
                      class: "mb-1 block text-sm font-medium",
                      children: "Pull quote (optional)"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      id: "press-draft-quote",
                      maxlength: 500,
                      rows: 3,
                      class: "w-full rounded-radius border border-outline bg-surface px-3 py-2 text-sm",
                      placeholder: "A short excerpt from the review",
                      ...{ "x-model": "pressDraft.quote" }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    class: "text-sm text-danger",
                    ...{ "x-show": "pressModalError", "x-text": "pressModalError" }
                  }
                ),
                /* @__PURE__ */ jsxs("div", { class: "flex justify-end gap-2 pt-2", children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      color: "secondary",
                      width: "auto",
                      ...{ "x-on:click": "closePressModal()" },
                      children: "Cancel"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      type: "button",
                      variant: "solid",
                      color: "primary",
                      width: "auto",
                      ...{ "x-on:click": "savePressLink()" },
                      children: "Save link"
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      }
    )
  ] });
};
var BookPressLinksSection_default = BookPressLinksSection;
export {
  BookPressLinksSection_default as default
};
