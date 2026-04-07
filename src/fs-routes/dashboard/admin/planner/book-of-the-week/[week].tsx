import { createRoute } from "hono-fsr";
import {
  formValidator,
  paramValidator,
  queryValidator,
} from "../../../../../lib/validator";
import {
  bookOfTheWeekFormSchema,
  weekQuerySchema,
} from "../../../../../features/dashboard/admin/planner/schema";
import EditBOTWModal from "../../../../../features/dashboard/admin/planner/modals/EditBOTWModal";
import {
  getBookOfTheWeekForDateQuery,
  updateBookOfTheWeek,
} from "../../../../../features/dashboard/admin/planner/services";
import { parseWeekString } from "../../../../../lib/utils";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { getBookById } from "../../../../../features/dashboard/books/services";
import Alert from "../../../../../components/app/Alert";
import { deleteBookOfTheWeekByWeekStart } from "../../../../../features/dashboard/admin/planner/services";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime()))
    return showErrorAlert(c, "Invalid week");

  const [error, bookOfTheWeek] = await getBookOfTheWeekForDateQuery(weekStart);
  if (error) return showErrorAlert(c, error.reason);

  return c.html(<EditBOTWModal week={week} bookOfTheWeek={bookOfTheWeek} />);
});

export const POST = createRoute(
  formValidator(bookOfTheWeekFormSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const bookId = formData.bookId;
    const weekStart = formData.weekStart;
    const text = formData.text;

    const [error] = await updateBookOfTheWeek({
      weekStart,
      bookId,
      text: text ?? "",
    });
    if (error) return showErrorAlert(c, error.reason);

    const [bookErr, book] = await getBookById(bookId);
    if (bookErr || !book) return showErrorAlert(c, "Book not found");

    return c.html(
      <>
        <Alert type="success" message="Book of the Week edited!" />
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
    const [error] = await deleteBookOfTheWeekByWeekStart(weekStart);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <>
        <Alert type="success" message="Book of the Week deleted!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
