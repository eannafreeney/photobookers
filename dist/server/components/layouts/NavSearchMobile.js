import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const NavSearchMobile = () => {
  const alpineAttrs = {
    "x-data": "{ isOpen: false }",
    "x-on:click.outside": "isOpen = false"
  };
  const formAttrs = {
    "x-target": "search-results-mobile-container"
  };
  return /* @__PURE__ */ jsxs("div", { class: "md:hidden size-5", ...alpineAttrs, children: [
    /* @__PURE__ */ jsx(
      "form",
      {
        action: "/search/mobile",
        method: "get",
        autocomplete: "off",
        ...formAttrs,
        children: /* @__PURE__ */ jsx("button", { class: "block size-full w-full h-full", children: searchIcon })
      }
    ),
    /* @__PURE__ */ jsx("div", { id: "search-results-mobile-container" })
  ] });
};
var NavSearchMobile_default = NavSearchMobile;
const searchIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "2",
    stroke: "currentColor",
    "aria-hidden": "true",
    class: " text-on-surface/50 size-5",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      }
    )
  }
);
const closeIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "2",
    stroke: "currentColor",
    class: "size-6",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M6 18 18 6M6 6l12 12"
      }
    )
  }
);
export {
  closeIcon,
  NavSearchMobile_default as default
};
