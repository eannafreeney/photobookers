import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Spinner, Text } from "../../../lib/hxml-comps.js";
const LazyLoader = ({ id, href, style, trigger = "visible" }) => {
  return /* @__PURE__ */ jsxs(
    "view",
    {
      id,
      style,
      trigger,
      once: "true",
      verb: "get",
      href,
      action: "replace",
      children: [
        /* @__PURE__ */ jsx(Spinner, {}),
        /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Loading\u2026" })
      ]
    }
  );
};
var LazyLoader_default = LazyLoader;
export {
  LazyLoader_default as default
};
