import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { fadeTransition } from "../../lib/transitions.js";
const InputLabel = ({
  label,
  maxLength,
  name,
  required,
  isError,
  isSuccess
}) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between text-xs", children: [
    /* @__PURE__ */ jsxs("legend", { class: "w-fit pl-0.5 kicker text-on-surface", children: [
      label,
      " ",
      label && required && /* @__PURE__ */ jsx("span", { class: "text-accent", children: " *" })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
      maxLength && /* @__PURE__ */ jsxs(
        "div",
        {
          class: "text-xs",
          "x-bind:class": `
          ${maxLength} - ${name}.length <= 10 
          ? 'text-danger font-medium' 
          : ${maxLength} - ${name}.length <= 30 
          ? 'text-warning' 
          : 'text-on-surface/60'
          `,
          children: [
            /* @__PURE__ */ jsx("span", { "x-text": `${name}.length` }),
            " / ",
            maxLength
          ]
        }
      ),
      /* @__PURE__ */ jsx(InputError, { isError, isSuccess, name })
    ] })
  ] });
};
var InputLabel_default = InputLabel;
const InputError = ({ isError, isSuccess, name }) => /* @__PURE__ */ jsx("div", { class: "text-xs min-h-4 my-2 block", children: isError ? /* @__PURE__ */ jsx("span", { class: "text-danger block text-right", ...fadeTransition, children: "\u2717 Taken" }) : isSuccess ? /* @__PURE__ */ jsx("span", { class: "text-success block text-right", ...fadeTransition, children: "\u2713 Available" }) : /* @__PURE__ */ jsx(
  "span",
  {
    class: "text-danger block text-left",
    "x-show": `errors && errors.${name}`,
    "x-text": `errors && errors.${name}`,
    ...fadeTransition
  }
) });
export {
  InputLabel_default as default
};
