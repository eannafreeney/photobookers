import { jsx } from "hono/jsx/jsx-runtime";
const FormElementWrapper = ({ children }) => {
  return /* @__PURE__ */ jsx("fieldset", { class: "grid gap-0 text-xs grid-cols-1 auto-rows-max", children });
};
var FormElementWrapper_default = FormElementWrapper;
export {
  FormElementWrapper_default as default
};
