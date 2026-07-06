import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const ViewAllLink = ({ href, text }) => {
  return /* @__PURE__ */ jsx(
    "a",
    {
      href,
      class: "hidden sm:inline-flex kicker group text-on-surface-weak hover:text-accent duration-300 border-b-2 border-transparent hover:border-accent",
      children: /* @__PURE__ */ jsxs("span", { class: "inline-flex items-center ", children: [
        `View All ${text ?? ""}`,
        /* @__PURE__ */ jsx("span", { class: "w-0 overflow-hidden opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap ", children: "\xA0\u2192" })
      ] })
    }
  );
};
var ViewAllLink_default = ViewAllLink;
export {
  ViewAllLink_default as default
};
