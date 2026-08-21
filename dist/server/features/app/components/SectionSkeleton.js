import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import clsx from "clsx";
const Block = ({ class: className }) => /* @__PURE__ */ jsx(
  "div",
  {
    class: clsx(
      "rounded-radius bg-on-surface/10 motion-safe:animate-pulse",
      className
    ),
    "aria-hidden": "true"
  }
);
const Header = () => /* @__PURE__ */ jsxs("div", { class: "mb-6 flex items-end justify-between gap-4 border-t-2 border-on-surface-strong pt-3", children: [
  /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx(Block, { class: "h-2.5 w-24" }),
    /* @__PURE__ */ jsx(Block, { class: "h-7 w-44" })
  ] }),
  /* @__PURE__ */ jsx(Block, { class: "h-2.5 w-16" })
] });
const Row = ({ count, item }) => /* @__PURE__ */ jsx("div", { class: "flex gap-4 overflow-hidden", children: Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsx(Block, { class: clsx("shrink-0", item) }, index)) });
const Body = ({ variant }) => {
  switch (variant) {
    case "stats":
      return /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3", children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ jsx(Block, { class: "h-16 w-full" }, index)) });
    case "circles":
      return /* @__PURE__ */ jsx("div", { class: "flex gap-3 overflow-hidden", children: Array.from({ length: 10 }).map((_, index) => /* @__PURE__ */ jsxs("div", { class: "flex shrink-0 flex-col items-center gap-2", children: [
        /* @__PURE__ */ jsx(Block, { class: "size-24 rounded-full" }),
        /* @__PURE__ */ jsx(Block, { class: "h-4 w-16" }),
        /* @__PURE__ */ jsx(Block, { class: "size-8 rounded-full" })
      ] }, index)) });
    case "spread":
      return /* @__PURE__ */ jsxs("div", { class: "grid gap-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]", children: [
        /* @__PURE__ */ jsx(Block, { class: "h-[300px] w-full md:h-[396px]" }),
        /* @__PURE__ */ jsxs("div", { class: "flex flex-col justify-center gap-4 bg-surface-alt px-6 py-8 sm:px-10", children: [
          /* @__PURE__ */ jsx(Block, { class: "h-6 w-full" }),
          /* @__PURE__ */ jsx(Block, { class: "h-6 w-11/12" }),
          /* @__PURE__ */ jsx(Block, { class: "h-6 w-3/4" }),
          /* @__PURE__ */ jsx(Block, { class: "h-6 w-2/3 md:hidden" }),
          /* @__PURE__ */ jsx(Block, { class: "mt-2 h-3 w-32" })
        ] })
      ] });
    case "cards":
      return /* @__PURE__ */ jsx(Row, { count: 5, item: "h-[300px] w-[220px]" });
    case "grid":
      return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsx(Block, { class: "h-10 w-full" }),
        /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6", children: Array.from({ length: 10 }).map((_, index) => /* @__PURE__ */ jsx(Block, { class: "h-[464px] w-full lg:h-[423px]" }, index)) })
      ] });
    case "rows":
      return /* @__PURE__ */ jsx("div", { class: "flex flex-col", children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          class: "flex items-center gap-6 border-t border-outline py-6 first:border-t-0",
          children: [
            /* @__PURE__ */ jsx(Block, { class: "h-10 w-20" }),
            /* @__PURE__ */ jsxs("div", { class: "flex flex-1 flex-col gap-2", children: [
              /* @__PURE__ */ jsx(Block, { class: "h-4 w-52" }),
              /* @__PURE__ */ jsx(Block, { class: "h-3 w-72" })
            ] })
          ]
        },
        index
      )) });
    case "columns":
      return /* @__PURE__ */ jsx("div", { class: "grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: 9 }).map((_, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          class: "flex flex-col gap-2 border-t border-outline py-4 first:border-t-0 sm:first:border-t",
          children: [
            /* @__PURE__ */ jsx(Block, { class: "h-4 w-40" }),
            /* @__PURE__ */ jsx(Block, { class: "h-3 w-24" })
          ]
        },
        index
      )) });
  }
};
const MobileButton = () => /* @__PURE__ */ jsx("div", { class: "mt-8 flex justify-center md:hidden", children: /* @__PURE__ */ jsx(Block, { class: "h-11 w-48" }) });
const WITH_MOBILE_BUTTON = [
  "circles",
  "spread",
  "cards",
  "rows",
  "columns"
];
const SectionSkeleton = ({
  variant,
  withHeader = true
}) => /* @__PURE__ */ jsxs("div", { children: [
  withHeader ? /* @__PURE__ */ jsx(Header, {}) : null,
  /* @__PURE__ */ jsx(Body, { variant }),
  WITH_MOBILE_BUTTON.includes(variant) ? /* @__PURE__ */ jsx(MobileButton, {}) : null
] });
var SectionSkeleton_default = SectionSkeleton;
export {
  SectionSkeleton_default as default
};
