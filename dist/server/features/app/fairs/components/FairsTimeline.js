import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { formatCountry } from "../../../../lib/utils.js";
import { formatFairDateRange, isFairRunning } from "../fairDateRange.js";
const place = (fair) => [fair.city, fair.country ? formatCountry(fair.country) : null].filter(Boolean).join(", ");
const FairsTimeline = ({ fairs }) => {
  const now = /* @__PURE__ */ new Date();
  return /* @__PURE__ */ jsx("ol", { class: "flex flex-col", children: fairs.map((fair) => {
    const range = formatFairDateRange(fair.startDate, fair.endDate);
    const running = isFairRunning(fair.startDate, fair.endDate, now);
    return /* @__PURE__ */ jsx("li", { class: "border-t border-outline first:border-t-0", children: /* @__PURE__ */ jsxs(
      "a",
      {
        href: `/fairs/${fair.slug}`,
        class: "group flex items-baseline gap-4 py-4 transition-colors hover:bg-surface-alt/50 sm:gap-6",
        children: [
          /* @__PURE__ */ jsxs("span", { class: "flex w-24 shrink-0 flex-col items-start sm:w-28", children: [
            range.month ? /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: range.month }) : null,
            /* @__PURE__ */ jsx("span", { class: "font-display text-xl font-medium leading-tight text-on-surface-strong tabular-nums sm:text-2xl", children: range.days })
          ] }),
          /* @__PURE__ */ jsxs("span", { class: "flex min-w-0 flex-1 flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxs("span", { class: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { class: "font-medium text-on-surface-strong group-hover:underline decoration-accent underline-offset-4", children: fair.name }),
              running ? /* @__PURE__ */ jsx("span", { class: "kicker rounded-radius bg-accent px-1.5 py-0.5 text-on-accent", children: "On now" }) : null
            ] }),
            (place(fair) || fair.venue) && /* @__PURE__ */ jsx("span", { class: "truncate text-sm text-on-surface-weak", children: [fair.venue, place(fair)].filter(Boolean).join(" \xB7 ") })
          ] }),
          /* @__PURE__ */ jsx("span", { class: "kicker hidden shrink-0 text-on-surface-weak transition-colors group-hover:text-on-surface-strong sm:inline", children: "Details \u2192" })
        ]
      }
    ) }, fair.id);
  }) });
};
var FairsTimeline_default = FairsTimeline;
export {
  FairsTimeline_default as default
};
