import { jsx } from "hono/jsx/jsx-runtime";
const ToastContainer = ({ children }) => {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "x-sync": true,
      id: "toast",
      "x-merge": "prepend",
      role: "status",
      class: "fixed bottom-4 right-4 z-50 flex flex-col gap-2 ",
      children
    }
  );
};
var ToastContainer_default = ToastContainer;
export {
  ToastContainer_default as default
};
