import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import InputLabel from "./InputLabel.js";
import { fadeTransition } from "../../lib/transitions.js";
import { getInputIcon } from "../../utils.js";
import { eyeIcon, eyeSlashIcon } from "../../lib/icons.js";
import FormElementWrapper from "./FormElementWrapper.js";
const Input = ({
  label,
  type = "text",
  placeholder = "",
  required = false,
  name,
  maxLength,
  step,
  validateInput,
  validationTrigger = "input",
  isDisabled = false,
  readOnly = false,
  isError = false,
  isSuccess = false,
  autofocus = false,
  showPasswordToggle = false,
  ...restProps
}) => {
  const eventByTrigger = {
    input: "x-on:input.debounce.500ms",
    blur: "x-on:blur",
    change: "x-on:change"
  };
  const inputValidator = validateInput ? { [eventByTrigger[validationTrigger]]: validateInput } : {};
  return /* @__PURE__ */ jsxs(FormElementWrapper, { children: [
    /* @__PURE__ */ jsx(
      InputLabel,
      {
        label,
        maxLength,
        name,
        required,
        isError,
        isSuccess
      }
    ),
    /* @__PURE__ */ jsxs("label", { class: "bg-surface rounded-radius border border-outline hover:border-outline-strong transition-colors text-on-surface -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-accent", children: [
      getInputIcon(type),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: name,
          type,
          class: "w-full bg-surface px-2 py-2 text-base md:text-sm font-normal focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 ",
          name: name.replace("form.", ""),
          placeholder: placeholder ?? label,
          required,
          disabled: isDisabled,
          "x-model": name,
          maxLength,
          step,
          autocomplete: "off",
          ...{
            "x-on:blur": `${name} = ${name}.trim()`
          },
          ...readOnly && { readOnly: true },
          ...validateInput && inputValidator,
          ...restProps
        }
      ),
      showPasswordToggle && /* @__PURE__ */ jsxs(
        "span",
        {
          "x-on:click": "togglePasswordVisibility()",
          class: "cursor-pointer inline-flex shrink-0",
          role: "button",
          tabIndex: 0,
          "aria-label": "Toggle password visibility",
          children: [
            /* @__PURE__ */ jsx("span", { "x-show": "inputType === 'password'", ...fadeTransition, children: eyeIcon(5) }),
            /* @__PURE__ */ jsx("span", { "x-show": "inputType === 'text'", ...fadeTransition, children: eyeSlashIcon(5) })
          ]
        }
      )
    ] })
  ] });
};
var Input_default = Input;
export {
  Input_default as default
};
