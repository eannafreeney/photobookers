import { jsx } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
const Link = ({
  href,
  target,
  children,
  className,
  xTarget,
  title,
  hoverUnderline = false
}) => /* @__PURE__ */ jsx(
  "a",
  {
    class: clsx(
      "font-medium underline-offset-2 focus:underline focus:outline-hidden",
      className,
      hoverUnderline && "hover:underline"
    ),
    href,
    target,
    "x-target": xTarget,
    title,
    children
  }
);
var Link_default = Link;
export {
  Link_default as default
};
