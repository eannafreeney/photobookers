import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import { randomizeBooksOfTheDayForWeek } from "../../../../../../features/dashboard/admin/planner/services.js";
import { parseWeekString } from "../../../../../../lib/utils.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import Alert from "../../../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../../../lib/disatchEvents.js";
const POST = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }
  const [error, result] = await randomizeBooksOfTheDayForWeek(weekStart);
  if (error) return showErrorAlert(c, error.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Scheduled ${result.scheduled} random Book${result.scheduled === 1 ? "" : "s"} of the Day for this week.`
        }
      ),
      dispatchEvents(["planner:updated"])
    ] })
  );
});
export {
  POST
};
