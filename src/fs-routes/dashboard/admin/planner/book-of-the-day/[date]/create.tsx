import { createRoute } from "hono-fsr";
import {
  formValidator,
  paramValidator,
} from "../../../../../../lib/validator";
import {
  bookOfTheDayFormSchema,
  dateQuerySchema,
} from "../../../../../../features/dashboard/admin/planner/schema";
import ScheduleBOTDModal from "../../../../../../features/dashboard/admin/planner/modals/ScheduleBOTDModal";
import { setBookOfTheDay } from "../../../../../../features/dashboard/admin/planner/services";
import { showErrorAlert } from "../../../../../../lib/alertHelpers";
import Alert from "../../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(dateQuerySchema), async (c) => {
  const date = c.req.valid("param").date;
  return c.html(<ScheduleBOTDModal date={date} />);
});

export const POST = createRoute(
  formValidator(bookOfTheDayFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const bookId = formData.bookId;
    const date = formData.date;

    const [error] = await setBookOfTheDay({
      date,
      bookId,
    });
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Book of the Day set!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
