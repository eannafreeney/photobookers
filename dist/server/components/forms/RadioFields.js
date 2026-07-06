import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import InputLabel from "./InputLabel.js";
const RadioFields = ({
  label,
  name,
  options,
  required,
  validateInput
}) => /* @__PURE__ */ jsxs("fieldset", { class: "flex flex-col gap-2", children: [
  /* @__PURE__ */ jsx(InputLabel, { label, name, required }),
  /* @__PURE__ */ jsx("div", { class: "flex flex-wrap gap-4", children: options.map(({ value, label: label2 }) => /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-start gap-2 font-medium text-on-surface has-disabled:opacity-75 dark:text-on-surface-dark", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        id: `${name}-${value}`,
        type: "radio",
        class: "before:content[''] relative h-4 w-4 appearance-none cursor-pointer rounded-full border border-outline bg-surface-alt before:invisible before:absolute before:left-1/2 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-on-primary checked:border-primary checked:bg-primary checked:before:visible focus:outline-2 focus:outline-offset-2 focus:outline-outline-strong checked:focus:outline-primary disabled:cursor-not-allowed",
        name: name.replace("form.", ""),
        value,
        "x-model": name,
        ...{ "x-on:input.debounce.500ms": validateInput }
      }
    ),
    /* @__PURE__ */ jsx("label", { for: `${name}-${value}`, class: "text-sm", children: label2 })
  ] })) })
] });
var RadioFields_default = RadioFields;
export {
  RadioFields_default as default
};
