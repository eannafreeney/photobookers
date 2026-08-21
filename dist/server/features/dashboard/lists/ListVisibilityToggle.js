import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPatch from "../../../components/forms/FormPatch.js";
const ListVisibilityToggle = ({ list }) => {
  const intent = list.isPublic ? "make-private" : "make-public";
  const alpineAttrs = {
    "x-data": `{ isPublic: ${list.isPublic} }`,
    "x-target": `list-visibility-${list.id} toast`,
    "x-target.error": "toast",
    "x-on:ajax:error": `isPublic = ${list.isPublic}`
  };
  return /* @__PURE__ */ jsxs(
    FormPatch,
    {
      id: `list-visibility-${list.id}`,
      action: `/dashboard/lists/${list.id}`,
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "intent", value: intent }),
        /* @__PURE__ */ jsxs("label", { class: "cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              class: "peer sr-only",
              checked: list.isPublic,
              name: "isPublic",
              "x-on:change": "$root.requestSubmit()",
              title: list.isPublic ? "Make private" : "Make public"
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-[0.0625rem] after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-primary peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70" })
        ] })
      ]
    }
  );
};
var ListVisibilityToggle_default = ListVisibilityToggle;
export {
  ListVisibilityToggle_default as default
};
