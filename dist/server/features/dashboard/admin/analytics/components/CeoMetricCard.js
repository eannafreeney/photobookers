import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const deltaColor = (direction) => {
  if (direction === "up") return "text-green-700";
  if (direction === "down") return "text-red-700";
  return "text-on-surface";
};
const CeoMetricCard = ({
  label,
  value,
  delta,
  detail
}) => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 rounded-radius border border-outline bg-surface px-4 py-3 shadow-sm", children: [
  /* @__PURE__ */ jsx("p", { class: "text-2xl font-semibold text-on-surface-strong", children: typeof value === "number" ? value.toLocaleString() : value }),
  /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface", children: label }),
  delta ? /* @__PURE__ */ jsx("p", { class: `text-xs ${deltaColor(delta.direction)}`, children: delta.label }) : null,
  detail ? /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface", children: detail }) : null
] });
export {
  CeoMetricCard
};
