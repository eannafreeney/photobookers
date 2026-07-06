import { jsx } from "hono/jsx/jsx-runtime";
import { loadingIcon } from "../../../components/app/Pagination.js";
const Intersector = ({ id, endpoint, children }) => {
  const alpineAttrs = {
    "x-intersect.margin.500px": `$ajax('${endpoint}', { target: '${id}' })`
  };
  return /* @__PURE__ */ jsx("div", { id, "x-data": true, ...alpineAttrs, children: children || /* @__PURE__ */ jsx(LoadingIcon, {}) });
};
var Intersector_default = Intersector;
const LoadingIcon = () => /* @__PURE__ */ jsx("div", { class: "flex justify-center items-center min-h-screen", children: loadingIcon });
export {
  Intersector_default as default
};
