import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
import { closeIcon } from "../../lib/icons.js";
const NavSearch = ({ isMobile = false }) => {
  const alpineAttrs = {
    "x-data": "{ hasResults: false, searchValue: '' }",
    "@click.outside": "hasResults = false",
    "@keydown.escape.window": "hasResults = false; searchValue = ''; $refs.searchInput?.blur()"
  };
  const formAttrs = {
    "x-target": isMobile ? "search-results-mobile" : "search-results",
    "x-on:ajax:success": "hasResults = true"
  };
  const inputAttrs = {
    "x-model": "searchValue",
    "@input.debounce.500ms": "$el.form.requestSubmit()",
    "@focus": "$el.form.requestSubmit()"
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      class: clsx(
        "relative flex mr-auto flex-col gap-1 text-on-surface",
        isMobile ? "w-full" : "w-96"
      ),
      ...alpineAttrs,
      children: [
        /* @__PURE__ */ jsxs("form", { action: "/search", method: "get", autocomplete: "off", ...formAttrs, children: [
          searchIcon,
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              "x-ref": "searchInput",
              name: "search",
              placeholder: "Search",
              class: "w-full rounded-radius border border-outline bg-surface py-2.5 pl-10 pr-2 text-md md:text-sm focus:outline-none ",
              ...inputAttrs
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              "x-cloak": true,
              "x-show": "hasResults",
              class: "hidden md:block absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer opacity-70 hover:opacity-100",
              "x-on:click": "hasResults = false",
              children: closeIcon
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "hidden",
              name: "isMobile",
              value: isMobile ? "true" : "false"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            class: "absolute top-0 left-0 right-0 w-full z-50 ",
            "x-show": "hasResults",
            children: /* @__PURE__ */ jsx("div", { id: isMobile ? "search-results-mobile" : "search-results" })
          }
        )
      ]
    }
  );
};
var NavSearch_default = NavSearch;
const searchIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "2",
    stroke: "currentColor",
    "aria-hidden": "true",
    class: "absolute left-2.5 top-1/2 size-5 -translate-y-1/2 text-on-surface/50",
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
export {
  NavSearch_default as default
};
