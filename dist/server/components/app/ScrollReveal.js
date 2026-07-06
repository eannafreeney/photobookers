import { jsx } from "hono/jsx/jsx-runtime";
const ScrollReveal = ({ children }) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "x-data": `{ shown: false }`,
      "x-intersect": "shown = true",
      "x-bind:class": "shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'",
      class: "transition-all duration-700 ease-out",
      children
    }
  );
};
var ScrollReveal_default = ScrollReveal;
export {
  ScrollReveal_default as default
};
