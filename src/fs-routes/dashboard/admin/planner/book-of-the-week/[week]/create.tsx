import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../../lib/validator";
import {
  bookOfTheWeekFormSchema,
  weekQuerySchema,
} from "../../../../../../features/dashboard/admin/planner/schema";
import ScheduleBOTWModal from "../../../../../../features/dashboard/admin/planner/modals/ScheduleBOTWModal";
import { setBookOfTheWeek } from "../../../../../../features/dashboard/admin/planner/services";
import { showErrorAlert } from "../../../../../../lib/alertHelpers";
import Alert from "../../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../../lib/disatchEvents";
import { log } from "console";

export const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  return c.html(<ScheduleBOTWModal week={week} />);
});

export const POST = createRoute(
  formValidator(bookOfTheWeekFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const bookId = formData.bookId;
    const weekStart = formData.weekStart;

    const [error] = await setBookOfTheWeek({
      weekStart,
      bookId,
    });
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Book of the Week set!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
