import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import {
  publisherOfTheWeekFormSchema,
  weekQuerySchema,
} from "../../../../../features/dashboard/admin/planner/schema";
import SchedulePOTWModal from "../../../../../features/dashboard/admin/planner/modals/SchedulePOTWModal";
import { setPublisherOfTheWeek } from "../../../../../features/dashboard/admin/planner/services";
import Alert from "../../../../../components/app/Alert";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;

  return c.html(<SchedulePOTWModal week={week} />);
});

export const POST = createRoute(
  formValidator(publisherOfTheWeekFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const [error] = await setPublisherOfTheWeek({
      weekStart: form.weekStart,
      creatorId: form.creatorId,
      text: form.text ?? "",
    });

    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Publisher of the Week set!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
