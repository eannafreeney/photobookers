import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const FormDelete = ({
  id,
  action,
  children,
  ...alpineAttrs
}) => {
  return /* @__PURE__ */ jsxs("form", { id, method: "post", action, ...alpineAttrs, children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "_method", value: "DELETE" }),
    children
  ] });
};
var FormDelete_default = FormDelete;
export {
  FormDelete_default as default
};
