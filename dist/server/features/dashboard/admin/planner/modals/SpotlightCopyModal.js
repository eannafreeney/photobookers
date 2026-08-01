import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import { toDateString } from "../../../../../lib/utils.js";
import { formatDayLabel } from "../utils.js";
const SpotlightCopyModal = ({ week, items }) => {
  const saveAlpineAttrs = {
    "x-target": "toast",
    "x-target.error": "toast",
    "x-on:ajax:after": "$el.dataset.submitMode === 'save' ? ($dispatch('dialog:close'), $dispatch('planner:updated')) : null"
  };
  if (items.length === 0) {
    return /* @__PURE__ */ jsx(Modal, { title: `Spotlight copy - week ${week}`, maxWidth: "max-w-3xl", children: /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: "Schedule books of the day, artist of the week, or publisher of the week before editing spotlight copy." }) });
  }
  return /* @__PURE__ */ jsx(Modal, { title: `Spotlight copy - week ${week}`, maxWidth: "max-w-3xl", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { class: "mb-4 text-sm text-on-surface", children: "This copy appears on spotlight pages and is used to build preview emails and default Instagram captions. Manual edits override AI-generated blurbs." }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        ...saveAlpineAttrs,
        action: `/dashboard/admin/planner/spotlight-copy/${week}/prepare`,
        id: `spotlight-copy-form-${week}`,
        children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "week", value: week }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "submitMode", value: "save" }),
          /* @__PURE__ */ jsx("div", { class: "max-h-[min(60vh,calc(100dvh-12rem))] space-y-6 overflow-y-auto overscroll-contain pr-1", children: items.map((item) => {
            const fieldKey = item.kind === "botd" ? toDateString(item.date) : item.kind === "artist" ? "aotw" : "potw";
            const title = item.kind === "botd" ? formatDayLabel(item.date) : item.kind === "artist" ? "Artist of the week" : "Publisher of the week";
            return /* @__PURE__ */ jsx(
              SpotlightCopySection,
              {
                title,
                subtitle: item.title,
                fieldKey,
                currentBlurb: item.currentBlurb,
                sourceText: item.sourceText,
                week
              },
              fieldKey
            );
          }) }),
          /* @__PURE__ */ jsx("div", { class: "mt-4 flex flex-wrap items-center gap-3 border-t border-outline pt-4", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              onclick: `this.form.elements.submitMode.value='save'`,
              class: "rounded border border-primary bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:opacity-90 cursor-pointer",
              children: "Save"
            }
          ) })
        ]
      }
    )
  ] }) });
};
var SpotlightCopyModal_default = SpotlightCopyModal;
const SpotlightCopySection = ({
  title,
  subtitle,
  fieldKey,
  currentBlurb,
  sourceText,
  week
}) => /* @__PURE__ */ jsxs(
  "section",
  {
    class: "rounded border border-outline bg-surface-alt/40 p-4",
    "x-data": "{ isGenerating: false }",
    ...{
      "x-on:ajax:after": "isGenerating = false",
      "x-on:ajax:error": "isGenerating = false"
    },
    children: [
      /* @__PURE__ */ jsx("h3", { class: "mb-1 text-sm font-semibold text-on-surface-strong", children: title }),
      /* @__PURE__ */ jsx("p", { class: "mb-3 text-xs text-on-surface line-clamp-2", children: subtitle }),
      sourceText ? /* @__PURE__ */ jsxs("details", { class: "mb-3 text-xs text-on-surface", children: [
        /* @__PURE__ */ jsx("summary", { class: "cursor-pointer font-medium text-on-surface-strong", children: "Source text" }),
        /* @__PURE__ */ jsx("p", { class: "mt-2 whitespace-pre-wrap rounded border border-outline/60 bg-surface p-3", children: sourceText })
      ] }) : null,
      /* @__PURE__ */ jsx(
        "label",
        {
          for: `blurbs-${fieldKey}`,
          class: "mb-2 block text-xs font-medium text-on-surface",
          children: "Spotlight blurb"
        }
      ),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: `blurbs-${fieldKey}`,
          name: `blurbs[${fieldKey}]`,
          rows: 6,
          "x-merge": "replace",
          class: "w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface",
          children: currentBlurb
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "mt-3 flex items-center gap-2", children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "submit",
          form: `spotlight-copy-form-${week}`,
          formaction: `/dashboard/admin/planner/spotlight-copy/${week}/generate`,
          name: "fieldKey",
          value: fieldKey,
          onclick: `this.form.elements.submitMode.value='generate'`,
          "x-on:click": "isGenerating = true",
          "x-target": `toast blurbs-${fieldKey}`,
          ...{ "x-target.error": "toast" },
          "x-bind:class": "isGenerating ? 'pointer-events-none opacity-60' : ''",
          "x-bind:aria-busy": "isGenerating",
          class: "rounded border border-outline bg-surface px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-alt cursor-pointer",
          children: [
            /* @__PURE__ */ jsx("span", { "x-show": "!isGenerating", children: "Generate blurb" }),
            /* @__PURE__ */ jsx("span", { "x-show": "isGenerating", children: "Generating..." })
          ]
        }
      ) })
    ]
  }
);
export {
  SpotlightCopyModal_default as default
};
