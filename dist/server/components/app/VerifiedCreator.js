import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
const VerifiedCreator = ({
  creatorStatus = "stub",
  size = "md"
}) => {
  if (creatorStatus !== "verified") return /* @__PURE__ */ jsx(Fragment, {});
  const sizes = {
    xs: "size-4",
    sm: "size-6",
    md: "size-8",
    lg: "size-10"
  };
  return /* @__PURE__ */ jsx("div", { title: "Verified Creator", children: /* @__PURE__ */ jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      class: sizes[size],
      children: [
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", fill: "#3b82f6" }),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            stroke: "white",
            "stroke-width": "2.5",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M7.5 12l3 3 6-6"
          }
        )
      ]
    }
  ) });
};
var VerifiedCreator_default = VerifiedCreator;
export {
  VerifiedCreator_default as default
};
