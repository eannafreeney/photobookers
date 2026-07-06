import { jsx } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
const GridPanel = ({
  children,
  id,
  xMerge = "replace",
  isFullWidth = true,
  ...props
}) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      id,
      "x-merge": xMerge,
      className: clsx(
        "grid gap-4 grid-cols-1 sm:grid-cols-2",
        isFullWidth ? "lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" : "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      ),
      ...props,
      children
    }
  );
};
var GridPanel_default = GridPanel;
export {
  GridPanel_default as default
};
