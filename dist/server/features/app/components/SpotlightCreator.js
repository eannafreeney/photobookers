import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
const SpotlightCreator = ({
  creator,
  role,
  truncateName = true
}) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3", children: [
    creator.coverUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: creator.coverUrl,
        alt: creator.displayName,
        class: "size-12 shrink-0 rounded-full border border-outline object-cover"
      }
    ) : /* @__PURE__ */ jsx(
      "span",
      {
        class: "flex size-12 shrink-0 items-center justify-center rounded-full border border-outline bg-surface-alt text-sm font-semibold text-on-surface",
        "aria-hidden": "true",
        children: creator.displayName.charAt(0)
      }
    ),
    /* @__PURE__ */ jsxs("div", { class: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { class: "kicker text-accent", children: role }),
      /* @__PURE__ */ jsx("p", { class: "truncate font-display text-lg font-medium text-on-surface-strong", children: truncateName && creator.displayName.length > 18 ? creator.displayName.slice(0, 18) + "..." : creator.displayName })
    ] })
  ] });
};
var SpotlightCreator_default = SpotlightCreator;
export {
  SpotlightCreator_default as default
};
