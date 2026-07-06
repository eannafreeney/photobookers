import { jsx } from "hono/jsx/jsx-runtime";
const WindowTable = ({ children }) => {
  return /* @__PURE__ */ jsx("div", { class: "max-h-96 overflow-y-auto overscroll-contain border border-on-surface border-radius p-2", children });
};
var WindowTable_default = WindowTable;
export {
  WindowTable_default as default
};
