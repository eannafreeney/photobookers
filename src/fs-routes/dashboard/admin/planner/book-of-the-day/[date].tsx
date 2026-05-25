import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator";
import { dateQuerySchema } from "../../../../../features/dashboard/admin/planner/schema";
import { parseDateString } from "../../../../../lib/utils";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { deleteBookOfTheDayByDate } from "../../../../../features/dashboard/admin/planner/services";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const DELETE = createRoute(
  paramValidator(dateQuerySchema),
  async (c) => {
    const date = c.req.valid("param").date;
    const day = parseDateString(date);
    if (Number.isNaN(day.getTime())) return showErrorAlert(c, "Invalid date");

    const [error] = await deleteBookOfTheDayByDate(day);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Book of the Day deleted!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
