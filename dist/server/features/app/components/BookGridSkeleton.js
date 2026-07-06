import { jsx, jsxs } from "hono/jsx/jsx-runtime";
function BookGridSkeleton({ length = 15 }) {
  return /* @__PURE__ */ jsx("div", { class: "grid grid-cols-2 md:grid-cols-5 gap-6", children: Array.from({ length }).map((_, index) => /* @__PURE__ */ jsxs("div", { class: "flex w-52 flex-col gap-4", children: [
    /* @__PURE__ */ jsx(ImageSkeleton, {}),
    /* @__PURE__ */ jsx(DescriptionSkeleton, {})
  ] }, index)) });
}
var BookGridSkeleton_default = BookGridSkeleton;
const ImageSkeleton = () => /* @__PURE__ */ jsx(
  "div",
  {
    class: "flex h-44 w-60 items-center justify-center rounded-radius bg-on-surface/30 motion-safe:animate-pulse dark:bg-on-surface-dark/30",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 20 20",
        fill: "currentColor",
        "aria-hidden": "true",
        class: "size-12 fill-on-surface/30 dark:fill-on-surface-dark/30",
        children: /* @__PURE__ */ jsx(
          "path",
          {
            "fill-rule": "evenodd",
            d: "M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
            "clip-rule": "evenodd"
          }
        )
      }
    )
  }
);
const TitleSkeleton = () => /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
  /* @__PURE__ */ jsx(
    "div",
    {
      class: "size-16 animate-pulse rounded-full bg-on-surface/30 dark:bg-on-surface-dark/30",
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ jsxs("div", { class: "flex w-52 flex-col gap-2", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        class: "h-3.5 w-full animate-pulse rounded-radius bg-on-surface/30 dark:bg-on-surface-dark/30",
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        class: "h-3.5 w-1/2 animate-pulse rounded-radius bg-on-surface/30 dark:bg-on-surface-dark/30",
        "aria-hidden": "true"
      }
    )
  ] })
] });
const DescriptionSkeleton = () => /* @__PURE__ */ jsxs("div", { class: "flex w-full flex-col gap-2", children: [
  /* @__PURE__ */ jsx(
    "div",
    {
      class: "h-3.5 w-full animate-pulse rounded-radius bg-on-surface/30 dark:bg-on-surface-dark/30",
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ jsx(
    "div",
    {
      class: "h-3.5 w-full animate-pulse rounded-radius bg-on-surface/30 dark:bg-on-surface-dark/30",
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ jsx(
    "div",
    {
      class: "h-3.5 w-full animate-pulse rounded-radius bg-on-surface/30 dark:bg-on-surface-dark/30",
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ jsx(
    "div",
    {
      class: "h-3.5 w-1/2 animate-pulse rounded-radius bg-on-surface/30 dark:bg-on-surface-dark/30",
      "aria-hidden": "true"
    }
  )
] });
export {
  BookGridSkeleton_default as default
};
