import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import { toDateString, toWeekString } from "../../../../../lib/utils.js";
import { getWeekDays } from "../utils.js";
const RandomizeBOTDButton = ({ weekStart, botdByDate }) => {
  const emptyDayCount = getWeekDays(weekStart).filter(
    (day) => !botdByDate.has(toDateString(day))
  ).length;
  if (emptyDayCount === 0) return /* @__PURE__ */ jsx(Fragment, {});
  const weekKey = toWeekString(weekStart);
  const dayLabel = emptyDayCount === 1 ? "day" : "days";
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success": "$dispatch('planner:updated')",
    "@ajax:before": `confirm('Randomly schedule ${emptyDayCount} Book${emptyDayCount === 1 ? "" : "s"} of the Day for the ${emptyDayCount} open ${dayLabel} in this week?') || $event.preventDefault()`
  };
  return /* @__PURE__ */ jsx(
    FormPost,
    {
      action: `/dashboard/admin/planner/book-of-the-day/${weekKey}/randomize`,
      ...alpineAttrs,
      className: "inline",
      children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          class: "rounded border border-outline bg-surface-alt px-2 py-1 text-xs font-medium text-on-surface opacity-80 hover:bg-surface cursor-pointer",
          children: "Random BOTDs"
        }
      )
    }
  );
};
var RandomizeBOTDButton_default = RandomizeBOTDButton;
export {
  RandomizeBOTDButton_default as default
};
