import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { capitalize } from "../../../../../utils.js";
const ToggleButton = ({
  isSent,
  recipientType,
  botdDateLabel,
  compact = false,
  title
}) => {
  const action = recipientType ? `Email ${capitalize(recipientType)}` : "Send now";
  const label = botdDateLabel ? `${action} \xB7 ${botdDateLabel}` : action;
  const toggleTitle = title ?? label;
  if (compact) {
    return /* @__PURE__ */ jsxs(
      "label",
      {
        class: "cursor-pointer inline-flex items-center",
        title: toggleTitle,
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              class: "peer sr-only",
              checked: isSent,
              disabled: isSent,
              "x-on:change": "$el.form?.requestSubmit()"
            }
          ),
          /* @__PURE__ */ jsx("div", { class: "relative h-5 w-9 after:h-4 after:w-4 peer-checked:after:translate-x-4 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-success peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs("label", { class: "cursor-pointer inline-flex items-center gap-2", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        class: "peer sr-only",
        checked: isSent,
        disabled: isSent,
        title: toggleTitle,
        "x-on:change": "$el.form?.requestSubmit()"
      }
    ),
    /* @__PURE__ */ jsx("div", { class: "relative h-6 w-11 after:h-5 after:w-5 peer-checked:after:translate-x-5 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:top-0 after:my-auto after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-focus:peer-checked:outline-success peer-active:outline-offset-0 peer-disabled:cursor-not-allowed peer-disabled:opacity-70" }),
    /* @__PURE__ */ jsx("span", { class: "text-xs text-on-surface-strong", children: label })
  ] });
};
var ToggleButton_default = ToggleButton;
export {
  ToggleButton_default as default
};
