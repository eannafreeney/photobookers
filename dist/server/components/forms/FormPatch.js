import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const FormPatch = ({
  id,
  action,
  children,
  ...alpineAttrs
}) => {
  return /* @__PURE__ */ jsxs("form", { id, method: "post", action, ...alpineAttrs, children: [
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "_method", value: "PATCH" }),
    children
  ] });
};
var FormPatch_default = FormPatch;
export {
  FormPatch_default as default
};
