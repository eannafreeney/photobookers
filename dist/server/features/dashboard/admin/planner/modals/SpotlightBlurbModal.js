import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import FormPost from "../../../../../components/forms/FormPost.js";
const SpotlightBlurbModal = ({
  week,
  fieldKey,
  title,
  subtitle,
  currentBlurb,
  sourceText
}) => {
  const encodedWeek = encodeURIComponent(week);
  const encodedKey = encodeURIComponent(fieldKey);
  const saveAction = `/dashboard/admin/planner/spotlight-blurb/prepare?week=${encodedWeek}&key=${encodedKey}`;
  const generateAction = `/dashboard/admin/planner/spotlight-blurb/generate?week=${encodedWeek}&key=${encodedKey}`;
  const formAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:success": "$dispatch('dialog:close'), $dispatch('planner:updated')"
  };
  return /* @__PURE__ */ jsxs(Modal, { title, maxWidth: "max-w-2xl", children: [
    /* @__PURE__ */ jsx("p", { class: "mb-2 text-sm font-medium text-on-surface-strong", children: subtitle }),
    /* @__PURE__ */ jsx("p", { class: "mb-4 text-sm text-on-surface", children: "Edit this spotlight blurb manually, or generate a rewritten version from the source text." }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: saveAction,
        className: "space-y-4",
        ...formAttrs,
        "x-data": `spotlightBlurbModal('${generateAction}')`,
        ...{
          "x-on:ajax:after": "isGenerating = false",
          "x-on:ajax:error": "isGenerating = false"
        },
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "week", value: week }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "key", value: fieldKey }),
          sourceText ? /* @__PURE__ */ jsxs("details", { class: "text-xs text-on-surface", children: [
            /* @__PURE__ */ jsx("summary", { class: "cursor-pointer font-medium text-on-surface-strong", children: "Source text" }),
            /* @__PURE__ */ jsx("p", { class: "mt-2 whitespace-pre-wrap rounded border border-outline/60 bg-surface-alt p-3", children: sourceText })
          ] }) : null,
          /* @__PURE__ */ jsx(
            "label",
            {
              for: "spotlight-blurb-textarea",
              class: "block text-xs font-medium text-on-surface",
              children: "Spotlight blurb"
            }
          ),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "spotlight-blurb-textarea",
              name: "blurb",
              rows: 8,
              "x-merge": "replace",
              class: "w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface",
              children: currentBlurb
            }
          ),
          /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-2 border-t border-outline pt-4", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                ...{
                  "x-on:click.prevent": "generate()",
                  "x-bind:class": "isGenerating ? 'pointer-events-none opacity-60' : ''",
                  "x-bind:aria-busy": "isGenerating"
                },
                class: "rounded border border-outline bg-surface px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-alt cursor-pointer",
                children: [
                  /* @__PURE__ */ jsx("span", { "x-show": "!isGenerating", children: "Generate blurb" }),
                  /* @__PURE__ */ jsx("span", { "x-show": "isGenerating", children: "Generating..." })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                class: "rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer",
                children: "Save"
              }
            )
          ] })
        ]
      }
    )
  ] });
};
var SpotlightBlurbModal_default = SpotlightBlurbModal;
export {
  SpotlightBlurbModal_default as default
};
