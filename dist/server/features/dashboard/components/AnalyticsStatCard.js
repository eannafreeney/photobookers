import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const AnalyticsStatCard = ({
  label,
  value
}) => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 rounded-radius border border-outline bg-surface px-4 py-3 shadow-sm", children: [
  /* @__PURE__ */ jsx("p", { class: "text-2xl font-semibold text-on-surface-strong", children: typeof value === "number" ? value.toLocaleString() : value }),
  /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: label })
] });
export {
  AnalyticsStatCard
};
