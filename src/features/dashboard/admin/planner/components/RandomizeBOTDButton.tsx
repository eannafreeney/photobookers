import FormPost from "../../../../../components/forms/FormPost";
import { toDateString, toWeekString } from "../../../../../lib/utils";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import { getWeekDays } from "../utils";

type Props = {
  weekStart: Date;
  botdByDate: Map<string, BookOfTheDayWithBook>;
};

const RandomizeBOTDButton = ({ weekStart, botdByDate }: Props) => {
  const emptyDayCount = getWeekDays(weekStart).filter(
    (day) => !botdByDate.has(toDateString(day)),
  ).length;

  if (emptyDayCount === 0) return <></>;

  const weekKey = toWeekString(weekStart);
  const dayLabel = emptyDayCount === 1 ? "day" : "days";
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success": "$dispatch('planner:updated')",
    "@ajax:before": `confirm('Randomly schedule ${emptyDayCount} Book${emptyDayCount === 1 ? "" : "s"} of the Day for the ${emptyDayCount} open ${dayLabel} in this week?') || $event.preventDefault()`,
  };

  return (
    <FormPost
      action={`/dashboard/admin/planner/book-of-the-day/${weekKey}/randomize`}
      {...alpineAttrs}
      className="inline"
    >
      <button
        type="submit"
        class="rounded border border-outline bg-surface-alt px-2 py-1 text-xs font-medium text-on-surface opacity-80 hover:bg-surface"
      >
        Random BOTDs
      </button>
    </FormPost>
  );
};

export default RandomizeBOTDButton;
