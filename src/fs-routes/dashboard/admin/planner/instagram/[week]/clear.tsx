import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema";
import { clearWeekInstagramPreparation } from "../../../../../../features/dashboard/admin/planner/instagramServices";
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

  const [clearError, result] = await clearWeekInstagramPreparation(weekStart);
  if (clearError) return showErrorAlert(c, clearError.reason);

  if (result.cleared === 0) {
    return showErrorAlert(c, "No Instagram plan to clear for this week");
  }

  return c.html(
    <>
      <Alert
        type="success"
        message={`Cleared Instagram plan for ${result.cleared} item${result.cleared === 1 ? "" : "s"}. Remove any feed posts or stories already in Buffer manually if needed.`}
      />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
});
