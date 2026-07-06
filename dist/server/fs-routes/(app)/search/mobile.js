import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import NavSearch from "../../../components/layouts/NavSearch.js";
import { DISCOVER_TAGS } from "../../../constants/discover.js";
import { tagBooksUrl } from "../../../lib/tags.js";
import Link from "../../../components/app/Link.js";
import { capitalize } from "../../../utils.js";
import { closeIcon } from "../../../components/layouts/NavSearchMobile.js";
import Pill from "../../../components/app/Pill.js";
const GET = createRoute(async (c) => {
  return c.html(
    /* @__PURE__ */ jsx(
      "div",
      {
        id: "search-results-mobile-container",
        class: "fixed top-0 left-0 right-0 bottom-0 w-full z-10 backdrop-blur-2xl",
        "x-data": "{ isOpen: true }",
        "x-show": "isOpen",
        children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4 p-4", children: [
            /* @__PURE__ */ jsx(NavSearch, { isMobile: true }),
            /* @__PURE__ */ jsx("button", { "x-on:click": "isOpen = false", children: closeIcon })
          ] }),
          /* @__PURE__ */ jsx("div", { class: "flex flex-wrap items-center justify-center gap-6 p-4", children: DISCOVER_TAGS.map((tag) => /* @__PURE__ */ jsx(Link, { href: tagBooksUrl(tag), children: /* @__PURE__ */ jsx(Pill, { children: capitalize(tag) }, tag) }, tag)) })
        ] })
      }
    )
  );
});
export {
  GET
};
