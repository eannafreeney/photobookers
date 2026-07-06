import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import InputLabel from "./InputLabel.js";
import { fadeTransition } from "../../lib/transitions.js";
import { getInputIcon } from "../../utils.js";
const DateInput = ({
  label,
  name,
  type = "date",
  validateInput,
  required = false
}) => {
  return /* @__PURE__ */ jsxs("fieldset", { class: "grid gap-1.5 text-xs grid-cols-1 auto-rows-max", children: [
    /* @__PURE__ */ jsx(InputLabel, { label, name, required }),
    /* @__PURE__ */ jsxs(
      "label",
      {
        "x-on:click": `$el.querySelector('input[type=${type}]')?.showPicker?.()`,
        class: "bg-surface-alt rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary",
        children: [
          getInputIcon("date"),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: name,
              type,
              class: "w-full bg-surface-alt px-2 py-2 text-base md:text-sm font-normal cursor-pointer focus:outline-none",
              name: name.replace("form.", ""),
              required,
              "x-model": name,
              autocomplete: "off",
              ...{ "x-on:blur": `${name} = ${name}.trim()` },
              ...{ "x-on:input.debounce.500ms": validateInput }
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { class: "text-sm min-h-[20px] mt-1 block", children: /* @__PURE__ */ jsx(
      "span",
      {
        class: "text-danger",
        "x-show": `errors.${name}`,
        "x-text": `errors.${name}`,
        ...fadeTransition
      }
    ) })
  ] });
};
var DateInput_default = DateInput;
export {
  DateInput_default as default
};
