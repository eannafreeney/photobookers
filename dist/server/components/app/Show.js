import { Fragment, jsx } from "hono/jsx/jsx-runtime";
const Show = ({ children, when }) => {
  if (!when) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx(Fragment, { children });
};
var Show_default = Show;
export {
  Show_default as default
};
