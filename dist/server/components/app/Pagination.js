import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { leftArrowIcon, rightArrowIcon } from "../../lib/icons.js";
const Pagination = ({
  baseUrl,
  page,
  totalPages,
  targetId,
  scrollRef = "paginationContent",
  navId = "pagination",
  pageParam = "page"
}) => {
  if (totalPages <= 1) return /* @__PURE__ */ jsx(Fragment, {});
  const pageUrl = (p) => `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${pageParam}=${p}`;
  const prevAttrs = {
    "x-target": `pagination ${targetId}`,
    "x-on:click": `$refs.${scrollRef}?.scrollIntoView({ behavior: 'smooth', block: 'start' })`,
    ...page <= 1 && { "aria-disabled": "true" }
  };
  const nextAttrs = {
    "x-target": `pagination ${targetId}`,
    "x-on:click": `$refs.${scrollRef}?.scrollIntoView({ behavior: 'smooth', block: 'start' })`,
    ...page >= totalPages && { "aria-disabled": "true" }
  };
  return /* @__PURE__ */ jsx("nav", { id: navId, class: "flex items-center justify-center gap-2 mt-4", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-1", children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        ...prevAttrs,
        href: page > 1 ? pageUrl(page - 1) : void 0,
        class: "rounded px-2 py-1 text-sm font-medium text-primary hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50",
        children: leftArrowIcon
      }
    ),
    /* @__PURE__ */ jsxs("span", { class: "kicker text-on-surface", children: [
      page,
      " of ",
      totalPages
    ] }),
    /* @__PURE__ */ jsx(
      "a",
      {
        ...nextAttrs,
        href: page < totalPages ? pageUrl(page + 1) : void 0,
        class: "rounded px-2 py-1 text-sm font-medium text-primary hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50",
        children: rightArrowIcon
      }
    )
  ] }) });
};
const loadingIcon = /* @__PURE__ */ jsxs(
  "svg",
  {
    "aria-hidden": "true",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    class: "size-4 animate-spin text-primary",
    children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          opacity: "0.25",
          d: "M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        }
      ),
      /* @__PURE__ */ jsx("path", { d: "M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" })
    ]
  }
);
export {
  Pagination,
  loadingIcon
};
