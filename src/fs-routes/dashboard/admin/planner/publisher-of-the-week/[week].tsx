import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import {
  publisherOfTheWeekFormSchema,
  weekQuerySchema,
} from "../../../../../features/dashboard/admin/planner/schema";
import { parseWeekString } from "../../../../../lib/utils";
import {
  deletePublisherOfTheWeekByWeekStart,
  getPublisherOfTheWeekForDateQuery,
  updatePublisherOfTheWeek,
} from "../../../../../features/dashboard/admin/planner/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import EditPOTWModal from "../../../../../features/dashboard/admin/planner/modals/EditPOTWModal";
import Alert from "../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;

  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime()))
    return showErrorAlert(c, "Invalid week");

  const [err, publisherOfTheWeek] =
    await getPublisherOfTheWeekForDateQuery(weekStart);

  if (err)
    return showErrorAlert(
      c,
      err?.reason ?? "Failed to get publisher of the week",
    );

  return c.html(
    <EditPOTWModal week={week} publisherOfTheWeek={publisherOfTheWeek} />,
  );
});

export const POST = createRoute(
  formValidator(publisherOfTheWeekFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const [error] = await updatePublisherOfTheWeek({
      weekStart: form.weekStart,
      creatorId: form.creatorId,
      text: form.text ?? "",
    });
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Publisher of the Week updated!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);

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
