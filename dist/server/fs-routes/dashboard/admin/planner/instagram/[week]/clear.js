import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import { clearWeekInstagramPreparation } from "../../../../../../features/dashboard/admin/planner/instagramServices.js";
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
  const [clearError, result] = await clearWeekInstagramPreparation(weekStart);
  if (clearError) return showErrorAlert(c, clearError.reason);
  if (result.cleared === 0) {
    return showErrorAlert(c, "No Instagram plan to clear for this week");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Alert,
        {
          type: "success",
          message: `Cleared Instagram plan for ${result.cleared} item${result.cleared === 1 ? "" : "s"}. Remove any feed posts or stories already in Buffer manually if needed.`
        }
      ),
      dispatchEvents(["planner:updated"])
    ] })
  );
});
export {
  POST
};
