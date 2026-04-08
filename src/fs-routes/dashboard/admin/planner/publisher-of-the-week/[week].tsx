import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { weekQuerySchema } from "../../../../../features/dashboard/admin/planner/schema";
import { parseWeekString } from "../../../../../lib/utils";
import { deletePublisherOfTheWeekByWeekStart } from "../../../../../features/dashboard/admin/planner/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const DELETE = createRoute(
  paramValidator(weekQuerySchema),
  async (c) => {
    const week = c.req.valid("param").week;

    const weekStart = parseWeekString(week);
    if (Number.isNaN(weekStart.getTime()))
      return showErrorAlert(c, "Invalid week");

    const [error] = await deletePublisherOfTheWeekByWeekStart(weekStart);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Publisher of the Week removed." />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
