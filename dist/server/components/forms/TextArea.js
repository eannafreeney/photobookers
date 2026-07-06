import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { fadeTransition } from "../../lib/transitions.js";
import FormElementWrapper from "./FormElementWrapper.js";
import InputLabel from "./InputLabel.js";
const TextArea = ({
  label,
  minRows = 5,
  placeholder,
  maxLength,
  required,
  name,
  validateInput
}) => {
  const inputHandler = validateInput ? { "x-on:input.debounce.500ms": validateInput } : {};
  return /* @__PURE__ */ jsxs(FormElementWrapper, { children: [
    /* @__PURE__ */ jsx(
      InputLabel,
      {
        label,
        maxLength,
        name,
        required
      }
    ),
    /* @__PURE__ */ jsx(
      "label",
      {
        class: "bg-surface rounded-radius border border-outline hover:border-outline-strong transition-colors text-on-surface -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-accent\n",
        children: /* @__PURE__ */ jsx(
          "textarea",
          {
            class: "w-full bg-surface px-2.5 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
            name: name.replace("form.", ""),
            placeholder,
            rows: minRows,
            required,
            "x-model": name,
            "x-autosize": true,
            ...inputHandler
          }
        )
      }
    ),
    /* @__PURE__ */ jsx("div", { class: "text-error text-sm min-h-[20px] mt-1 block", children: /* @__PURE__ */ jsx(
      "span",
      {
        "x-show": `errors.${name}`,
        "x-text": `errors.${name}`,
        ...fadeTransition
      }
    ) })
  ] });
};
var TextArea_default = TextArea;
export {
  TextArea_default as default
};
