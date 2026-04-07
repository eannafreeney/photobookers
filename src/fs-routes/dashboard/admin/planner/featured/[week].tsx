import { createRoute } from "hono-fsr";
import {
  formValidator,
  paramValidator,
  queryValidator,
} from "../../../../../lib/validator";
import {
  featuredBooksFormSchema,
  weekQuerySchema,
} from "../../../../../features/dashboard/admin/planner/schema";
import EditFeaturedBooksModal from "../../../../../features/dashboard/admin/planner/modals/EditFeaturedBooksModal";
import {
  getFeaturedBooksForWeekQuery,
  setFeaturedBooksForWeek,
} from "../../../../../features/dashboard/admin/planner/services";
import { parseWeekString } from "../../../../../lib/utils";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { dispatchEvents } from "../../../../../lib/disatchEvents";

export const GET = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  const featuredBooks = Number.isNaN(weekStart.getTime())
    ? []
    : await getFeaturedBooksForWeekQuery(weekStart);

  return c.html(
    <EditFeaturedBooksModal featuredBooks={featuredBooks} week={week} />,
  );
});

export const POST = createRoute(
  formValidator(featuredBooksFormSchema),
  async (c) => {
    const form = c.req.valid("form");
    const weekStart = form.weekStart;
    const bookIds: [string, string, string, string, string] = [
      form.bookId1,
      form.bookId2,
      form.bookId3,
      form.bookId4,
      form.bookId5,
    ];

    const result = await setFeaturedBooksForWeek(weekStart, bookIds);

    if (!result.ok) {
      return showErrorAlert(
        c,
        result.error ?? "Failed to update featured books.",
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Featured books updated!" />
        {dispatchEvents(["planner:updated"])}
      </>,
    );
  },
);
