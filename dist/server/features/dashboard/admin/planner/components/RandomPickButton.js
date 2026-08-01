import { jsx } from "hono/jsx/jsx-runtime";
const RandomPickButton = ({ action, text }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success": "$dispatch('planner:updated')"
  };
  return /* @__PURE__ */ jsx("form", { method: "post", action, ...alpineAttrs, children: /* @__PURE__ */ jsx(
    "button",
    {
      type: "submit",
      class: "cursor-pointer flex w-full min-h-16 flex-col items-center justify-center rounded border border-dashed border-outline bg-surface-alt/50 py-4 text-sm font-medium text-on-surface hover:border-outline-strong hover:bg-surface-alt hover:text-on-surface",
      children: text
    }
  ) });
};
var RandomPickButton_default = RandomPickButton;
export {
  RandomPickButton_default as default
};
