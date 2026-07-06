import { jsx } from "hono/jsx/jsx-runtime";
const FormPost = ({
  id,
  action,
  children,
  className,
  ...alpineAttrs
}) => {
  return /* @__PURE__ */ jsx(
    "form",
    {
      id,
      method: "post",
      action,
      class: className,
      ...alpineAttrs,
      children
    }
  );
};
var FormPost_default = FormPost;
export {
  FormPost_default as default
};
