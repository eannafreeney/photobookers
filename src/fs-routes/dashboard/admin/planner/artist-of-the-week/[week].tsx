import { createRoute } from "hono-fsr";
import {
  formValidator,
  paramValidator,
  queryValidator,
} from "../../../../../lib/validator";
import {
  artistOfTheWeekFormSchema,
  weekQuerySchema,
} from "../../../../../features/dashboard/admin/planner/schema";
import { parseWeekString } from "../../../../../lib/utils";
import {
  deleteArtistOfTheWeekByWeekStart,
  getArtistOfTheWeekForDateQuery,
  updateArtistOfTheWeek,
} from "../../../../../features/dashboard/admin/planner/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import EditAOTWModal from "../../../../../features/dashboard/admin/planner/modals/EditAOTWModal";
import Alert from "../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;

  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime()))
    return showErrorAlert(c, "Invalid week");

  const [err, artistOfTheWeek] =
    await getArtistOfTheWeekForDateQuery(weekStart);
  if (err) return showErrorAlert(c, err.reason);

  return c.html(
    <EditAOTWModal week={week} artistOfTheWeek={artistOfTheWeek} />,
  );
});

export const POST = createRoute(
  formValidator(artistOfTheWeekFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const [error] = await updateArtistOfTheWeek({
      weekStart: form.weekStart,
      creatorId: form.creatorId,
      text: form.text ?? "",
    });
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Artist of the Week updated!" />
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

    const [error] = await deleteArtistOfTheWeekByWeekStart(weekStart);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Artist of the Week removed." />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
