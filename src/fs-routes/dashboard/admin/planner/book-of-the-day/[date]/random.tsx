import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { dateQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema";
import { setRandomBookOfTheDay } from "../../../../../../features/dashboard/admin/planner/services";
import { parseDateString } from "../../../../../../lib/utils";
import { showErrorAlert } from "../../../../../../lib/alertHelpers";
import Alert from "../../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../../lib/disatchEvents";

export const POST = createRoute(paramValidator(dateQuerySchema), async (c) => {
  const date = parseDateString(c.req.valid("param").date);
  if (Number.isNaN(date.getTime())) {
    return showErrorAlert(c, "Invalid date");
  }

  const [error] = await setRandomBookOfTheDay(date);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(
    <>
      <Alert type="success" message="Random Book of the Day set!" />
      {dispatchEvents(["planner:updated"])}
    </>,
  );
});
