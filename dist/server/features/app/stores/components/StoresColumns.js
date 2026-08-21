import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { formatCountry } from "../../../../lib/utils.js";
const StoresColumns = ({ stores }) => /* @__PURE__ */ jsx("ul", { class: "grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3", children: stores.map((store) => /* @__PURE__ */ jsx("li", { class: "border-t border-outline first:border-t-0 sm:first:border-t", children: /* @__PURE__ */ jsxs(
  "a",
  {
    href: `/stores/${store.slug}`,
    class: "group flex items-baseline justify-between gap-3 py-3",
    children: [
      /* @__PURE__ */ jsxs("span", { class: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("span", { class: "block truncate font-medium text-on-surface-strong group-hover:underline decoration-accent underline-offset-4", children: store.name }),
        /* @__PURE__ */ jsx("span", { class: "block truncate text-sm text-on-surface-weak", children: [store.city, formatCountry(store.country)].filter(Boolean).join(", ") })
      ] }),
      /* @__PURE__ */ jsx("span", { class: "kicker shrink-0 text-on-surface-weak transition-colors group-hover:text-on-surface-strong", children: "\u2192" })
    ]
  }
) }, store.id)) });
var StoresColumns_default = StoresColumns;
export {
  StoresColumns_default as default
};
