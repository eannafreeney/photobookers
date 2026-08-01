import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPatch from "../../../../components/forms/FormPatch.js";
const ListPromoteToggleForm = ({ listId, isPromoted, canPromote }) => {
  const alpineAttrs = {
    "x-data": `{ isPromoted: ${isPromoted} }`,
    "x-target": `list-promote-toggle-${listId} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPromoted = ${isPromoted}`
  };
  return /* @__PURE__ */ jsxs(
    FormPatch,
    {
      id: `list-promote-toggle-${listId}`,
      action: `/dashboard/admin/lists/${listId}/promote`,
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "hidden",
            name: "promoted",
            value: isPromoted ? "false" : "true"
          }
        ),
        /* @__PURE__ */ jsxs("label", { class: "cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              class: "peer sr-only",
              checked: isPromoted,
              "x-on:change": "$root.requestSubmit()",
              title: "Promote to homepage",
              disabled: !canPromote && !isPromoted
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70" })
        ] })
      ]
    }
  );
};
var ListPromoteToggleForm_default = ListPromoteToggleForm;
export {
  ListPromoteToggleForm_default as default
};
