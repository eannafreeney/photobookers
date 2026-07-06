import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import {
  analyticsSearchParams,
  matchesPreset,
  matchesYesterdayPreset,
  presetAnalyticsDateRange,
  yesterdayAnalyticsDateRange
} from "../../book-analytics/dateRange.js";
import { toDateString } from "../../../lib/utils.js";
import Button from "../../../components/app/Button.js";
const PRESETS = [
  { label: "All time", days: null },
  { label: "Yesterday", days: "yesterday" },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 }
];
const pillClass = (active) => `cursor-pointer px-4 py-1.5 rounded-full border-2 kicker transition-colors ${active ? "bg-on-surface-strong text-surface border-on-surface-strong" : "bg-surface text-on-surface-strong border-outline-strong hover:bg-on-surface-strong hover:text-surface"}`;
const AnalyticsDateRangeFilter = ({
  dateRange,
  basePath,
  partialUpdateTarget,
  tab,
  fragment
}) => {
  const searchParams = (range) => analyticsSearchParams(range, {
    ...tab ? { tab } : {},
    ...fragment ? { fragment } : {}
  });
  const customFrom = dateRange ? toDateString(dateRange.from) : "";
  const customTo = dateRange ? toDateString(dateRange.to) : "";
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("div", { class: "flex flex-wrap items-center justify-center gap-2", children: PRESETS.map((preset) => {
      const href = preset.days === null ? `${basePath}${searchParams(null)}` : preset.days === "yesterday" ? `${basePath}${searchParams(yesterdayAnalyticsDateRange())}` : `${basePath}${searchParams(
        presetAnalyticsDateRange(preset.days)
      )}`;
      const active = preset.days === null ? dateRange === null : preset.days === "yesterday" ? matchesYesterdayPreset(dateRange) : matchesPreset(dateRange, preset.days);
      return /* @__PURE__ */ jsx(
        "a",
        {
          href,
          class: pillClass(active),
          "aria-current": active ? "page" : void 0,
          ...partialUpdateTarget ? {
            "x-target": partialUpdateTarget,
            prefetch: "intent"
          } : {},
          children: preset.label
        },
        preset.label
      );
    }) }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        method: "get",
        action: basePath,
        class: "flex flex-wrap items-end justify-center gap-3",
        ...partialUpdateTarget ? { "x-target": partialUpdateTarget } : {},
        children: [
          tab ? /* @__PURE__ */ jsx("input", { type: "hidden", name: "tab", value: tab }) : null,
          fragment ? /* @__PURE__ */ jsx("input", { type: "hidden", name: "fragment", value: fragment }) : null,
          /* @__PURE__ */ jsxs("label", { class: "flex flex-col gap-1 text-sm text-on-surface", children: [
            /* @__PURE__ */ jsx("span", { children: "From" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                name: "from",
                value: customFrom,
                class: "rounded-radius border border-outline bg-surface px-2 py-2 text-sm text-on-surface focus:outline focus:outline-offset-2 focus:outline-primary",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { class: "flex flex-col gap-1 text-sm text-on-surface", children: [
            /* @__PURE__ */ jsx("span", { children: "To" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                name: "to",
                value: customTo,
                class: "rounded-radius border border-outline bg-surface px-2 py-2 text-sm text-on-surface focus:outline focus:outline-offset-2 focus:outline-primary",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: "Apply" })
        ]
      }
    )
  ] });
};
var AnalyticsDateRangeFilter_default = AnalyticsDateRangeFilter;
export {
  AnalyticsDateRangeFilter_default as default
};
