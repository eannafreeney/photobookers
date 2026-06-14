import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema";
import { randomizeBooksOfTheDayForWeek } from "../../../../../../features/dashboard/admin/planner/services";
import { parseWeekString } from "../../../../../../lib/utils";
import { showErrorAlert } from "../../../../../../lib/alertHelpers";
import Alert from "../../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../../lib/disatchEvents";

export const POST = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }

  const [error, result] = await randomizeBooksOfTheDayForWeek(weekStart);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert
        type="success"
        message={`Scheduled ${result.scheduled} random Book${result.scheduled === 1 ? "" : "s"} of the Day for this week.`}
      />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
});
