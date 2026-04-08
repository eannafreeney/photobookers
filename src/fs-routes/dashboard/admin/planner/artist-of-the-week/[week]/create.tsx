import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator";
import {
  artistOfTheWeekFormSchema,
  weekQuerySchema,
} from "../../../../../../features/dashboard/admin/planner/schema";
import ScheduleAOTWModal from "../../../../../../features/dashboard/admin/planner/modals/ScheduleAOTWModal";
import { setArtistOfTheWeek } from "../../../../../../features/dashboard/admin/planner/services";
import Alert from "../../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  console.log("week", week);
  return c.html(<ScheduleAOTWModal week={week} />);
});

export const POST = createRoute(
  formValidator(artistOfTheWeekFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const row = await setArtistOfTheWeek({
      weekStart: form.weekStart,
      creatorId: form.creatorId,
    });
    if (!row) {
      return c.html(
        <div id="artist-of-the-week-errors" class="text-danger text-sm my-2">
          Failed to set artist of the week (week may already have one).
        </div>,
        422,
      );
    }
    return c.html(
      <>
        <Alert type="success" message="Artist of the Week set!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
